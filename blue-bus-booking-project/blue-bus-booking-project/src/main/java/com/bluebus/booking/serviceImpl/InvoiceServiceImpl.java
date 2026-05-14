package com.bluebus.booking.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Payment;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.PaymentRepository;
import com.bluebus.booking.service.InvoiceService;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class InvoiceServiceImpl implements InvoiceService {

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Override
	@Transactional(readOnly = true)
	public byte[] generateInvoice(Long bookingId) {
		try {
			Booking booking = bookingRepository.findById(bookingId)
					.orElseThrow(() -> new RuntimeException("Booking not found"));

			Payment payment = paymentRepository
					.findTopByBookingIdAndStatusOrderByCreatedAtDesc(bookingId,
							com.bluebus.booking.dto.enums.PaymentStatus.SUCCESS)
					.orElseThrow(() -> new RuntimeException("Successful payment not found"));

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			Document document = new Document(PageSize.A4);
			PdfWriter.getInstance(document, outputStream);
			document.open();

			// --- Fonts ---
			Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.WHITE);
			Font invoiceTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new BaseColor(37, 99, 235));
			Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
			Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
			Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);
			Font boldCellFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.BLACK);

			// --- Header ---
			PdfPTable headerTable = new PdfPTable(1);
			headerTable.setWidthPercentage(100);
			PdfPCell headerCell = new PdfPCell(new Phrase("BLUE BUS BOOKING", headerFont));
			headerCell.setBackgroundColor(new BaseColor(37, 99, 235));
			headerCell.setPadding(15);
			headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
			headerCell.setBorder(Rectangle.NO_BORDER);
			headerTable.addCell(headerCell);
			document.add(headerTable);

			document.add(new Paragraph(" "));
			
			// --- Invoice Info ---
			PdfPTable infoTable = new PdfPTable(2);
			infoTable.setWidthPercentage(100);
			
			PdfPCell infoLeft = new PdfPCell();
			infoLeft.setBorder(Rectangle.NO_BORDER);
			infoLeft.addElement(new Paragraph("TAX INVOICE", invoiceTitleFont));
			infoLeft.addElement(new Paragraph("Invoice No: INV-" + booking.getBookingReference(), cellFont));
			infoLeft.addElement(new Paragraph("Date: " + java.time.LocalDate.now(), cellFont));
			infoTable.addCell(infoLeft);
			
			PdfPCell infoRight = new PdfPCell();
			infoRight.setBorder(Rectangle.NO_BORDER);
			infoRight.setHorizontalAlignment(Element.ALIGN_RIGHT);
			infoRight.addElement(new Paragraph("Billed To:", sectionHeaderFont));
			infoRight.addElement(new Paragraph(booking.getUser().getName(), cellFont));
			infoRight.addElement(new Paragraph(booking.getContactEmail(), cellFont));
			infoTable.addCell(infoRight);
			
			document.add(infoTable);
			document.add(new Paragraph(" "));

			LineSeparator ls = new LineSeparator();
			ls.setLineColor(new BaseColor(229, 231, 235));
			document.add(ls);
			document.add(new Paragraph(" "));

			// --- Journey Brief ---
			document.add(new Paragraph("Travel Details:", sectionHeaderFont));
			document.add(new Paragraph(booking.getTrip().getRoute().getSource() + " to " + booking.getTrip().getRoute().getDestination() + " | " + booking.getTrip().getJourneyDate(), cellFont));
			document.add(new Paragraph(" "));

			// --- Fare Table ---
			PdfPTable fareTable = new PdfPTable(2);
			fareTable.setWidthPercentage(100);
			fareTable.setWidths(new float[]{3, 1});

			// Header Row
			PdfPCell h1 = new PdfPCell(new Phrase("Description", tableHeaderFont));
			h1.setBackgroundColor(new BaseColor(31, 41, 55));
			h1.setPadding(8);
			fareTable.addCell(h1);
			
			PdfPCell h2 = new PdfPCell(new Phrase("Amount", tableHeaderFont));
			h2.setBackgroundColor(new BaseColor(31, 41, 55));
			h2.setPadding(8);
			h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
			fareTable.addCell(h2);

			// Base Fare
			fareTable.addCell(new PdfPCell(new Phrase("Base Bus Fare", cellFont)) {{ setPadding(8); }});
			fareTable.addCell(new PdfPCell(new Phrase("\u20B9" + booking.getTotalAmount(), cellFont)) {{ setPadding(8); setHorizontalAlignment(Element.ALIGN_RIGHT); }});

			// Discount
			if (payment.getDiscountApplied() != null && payment.getDiscountApplied().compareTo(BigDecimal.ZERO) > 0) {
				fareTable.addCell(new PdfPCell(new Phrase("Discount (" + payment.getUsedCouponCode() + ")", cellFont)) {{ setPadding(8); }});
				fareTable.addCell(new PdfPCell(new Phrase("- \u20B9" + payment.getDiscountApplied(), new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, new BaseColor(220, 38, 38)))) {{ setPadding(8); setHorizontalAlignment(Element.ALIGN_RIGHT); }});
			}

			// Total
			PdfPCell totalLabel = new PdfPCell(new Phrase("Total Amount Paid", boldCellFont));
			totalLabel.setPadding(10);
			totalLabel.setBackgroundColor(new BaseColor(249, 250, 251));
			fareTable.addCell(totalLabel);
			
			PdfPCell totalVal = new PdfPCell(new Phrase("\u20B9" + payment.getAmount(), boldCellFont));
			totalVal.setPadding(10);
			totalVal.setBackgroundColor(new BaseColor(249, 250, 251));
			totalVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
			fareTable.addCell(totalVal);

			document.add(fareTable);
			
			document.add(new Paragraph(" "));
			document.add(new Paragraph("Payment Information:", sectionHeaderFont));
			document.add(new Paragraph("Method: " + payment.getPaymentMethod() + " | ID: " + payment.getRazorpayPaymentId(), cellFont));
			document.add(new Paragraph("Status: " + payment.getStatus(), cellFont));

			document.add(new Paragraph(" "));
			document.add(new Paragraph(" "));
			Paragraph footer = new Paragraph("Thank you for choosing Blue Bus Booking. This is a computer-generated invoice.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY));
			footer.setAlignment(Element.ALIGN_CENTER);
			document.add(footer);

			document.close();
			return outputStream.toByteArray();

		} catch (Exception e) {
			log.error("Failed to generate invoice for booking {}: {}", bookingId, e.getMessage(), e);
			throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
		}
	}

}
