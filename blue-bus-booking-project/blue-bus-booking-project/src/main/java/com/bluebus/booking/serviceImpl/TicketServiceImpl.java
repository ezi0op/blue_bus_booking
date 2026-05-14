package com.bluebus.booking.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Payment;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.PaymentRepository;
import com.bluebus.booking.service.QRCodeService;
import com.bluebus.booking.service.TicketService;
import com.itextpdf.text.Document;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;

@Service
public class TicketServiceImpl implements TicketService {

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private QRCodeService qrCodeService;

	@Override
	public byte[] generateTicket(Long bookingId) {

		try {
			Booking booking = bookingRepository.findById(bookingId)
					.orElseThrow(() -> new RuntimeException("Booking not found"));

			Payment payment = paymentRepository
					.findTopByBookingIdAndStatusOrderByCreatedAtDesc(bookingId,
							com.bluebus.booking.dto.enums.PaymentStatus.SUCCESS)
					.orElseThrow(() -> new RuntimeException("Successful payment not found"));

			String seatNumbers = booking.getBookingItems().stream().map(item -> item.getSeat().getSeatNumber())
					.collect(Collectors.joining(", "));

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			Document document = new Document(PageSize.A4);
			PdfWriter.getInstance(document, outputStream);
			document.open();

			// --- Fonts ---
			Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.WHITE);
			Font sectionHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(37, 99, 235));
			Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.GRAY);
			Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
			Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);

			// --- Header Section ---
			PdfPTable headerTable = new PdfPTable(1);
			headerTable.setWidthPercentage(100);
			PdfPCell headerCell = new PdfPCell(new Phrase("BLUE BUS BOOKING", headerFont));
			headerCell.setBackgroundColor(new BaseColor(37, 99, 235)); // Blue
			headerCell.setPadding(20);
			headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
			headerCell.setBorder(Rectangle.NO_BORDER);
			headerTable.addCell(headerCell);
			document.add(headerTable);

			document.add(new Paragraph(" "));
			document.add(new Paragraph("BUS TICKET / BOARDING PASS", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
			document.add(new Paragraph("PNR: " + booking.getBookingReference(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(37, 99, 235))));
			document.add(new Paragraph(" "));
			
			LineSeparator ls = new LineSeparator();
			ls.setLineColor(new BaseColor(229, 231, 235));
			document.add(ls);
			document.add(new Paragraph(" "));

			// --- Main Content Table (2 columns) ---
			PdfPTable mainTable = new PdfPTable(2);
			mainTable.setWidthPercentage(100);
			mainTable.setSpacingBefore(10);

			// Left Column: Journey Details
			PdfPCell leftCell = new PdfPCell();
			leftCell.setBorder(Rectangle.NO_BORDER);
			leftCell.addElement(new Paragraph("JOURNEY DETAILS", sectionHeaderFont));
			leftCell.addElement(new Paragraph(" "));
			
			leftCell.addElement(new Phrase("Route", labelFont));
			leftCell.addElement(new Paragraph(booking.getTrip().getRoute().getSource() + " \u2192 " + booking.getTrip().getRoute().getDestination(), valueFont));
			leftCell.addElement(new Paragraph(" "));
			
			leftCell.addElement(new Phrase("Journey Date", labelFont));
			leftCell.addElement(new Paragraph(booking.getTrip().getJourneyDate().toString(), valueFont));
			leftCell.addElement(new Paragraph(" "));
			
			leftCell.addElement(new Phrase("Departure", labelFont));
			leftCell.addElement(new Paragraph(booking.getTrip().getDepartureTime().toString(), valueFont));
			leftCell.addElement(new Paragraph(" "));
			
			leftCell.addElement(new Phrase("Bus Type", labelFont));
			leftCell.addElement(new Paragraph(booking.getTrip().getBus().getBusType() + " (" + booking.getTrip().getBus().getBusNumber() + ")", valueFont));
			leftCell.addElement(new Paragraph(" "));
			
			leftCell.addElement(new Phrase("Seats", labelFont));
			leftCell.addElement(new Paragraph(seatNumbers, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new BaseColor(37, 99, 235))));

			mainTable.addCell(leftCell);

			// Right Column: Passenger & QR
			PdfPCell rightCell = new PdfPCell();
			rightCell.setBorder(Rectangle.NO_BORDER);
			rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
			
			rightCell.addElement(new Paragraph("PASSENGER INFO", sectionHeaderFont));
			rightCell.addElement(new Paragraph(" "));
			
			rightCell.addElement(new Phrase("Lead Passenger", labelFont));
			rightCell.addElement(new Paragraph(booking.getUser().getName(), valueFont));
			rightCell.addElement(new Paragraph(" "));
			
			rightCell.addElement(new Phrase("Contact", labelFont));
			rightCell.addElement(new Paragraph(booking.getContactEmail(), valueFont));
			rightCell.addElement(new Paragraph(booking.getContactPhone(), valueFont));
			rightCell.addElement(new Paragraph(" "));

			// Add QR Code
			String qrText = "PNR:" + booking.getBookingReference() + "|USER:" + booking.getUser().getName() + "|SEATS:" + seatNumbers;
			byte[] qrCodeBytes = qrCodeService.generateQRCode(qrText, 200, 200);
			Image qrImage = Image.getInstance(qrCodeBytes);
			qrImage.scaleToFit(120, 120);
			qrImage.setAlignment(Element.ALIGN_LEFT);
			rightCell.addElement(qrImage);
			rightCell.addElement(new Paragraph("Scan for Verification", footerFont));

			mainTable.addCell(rightCell);
			document.add(mainTable);

			document.add(new Paragraph(" "));
			document.add(ls);
			document.add(new Paragraph(" "));

			// --- Footer / Payment Summary ---
			PdfPTable paymentTable = new PdfPTable(2);
			paymentTable.setWidthPercentage(100);
			
			PdfPCell pCell1 = new PdfPCell(new Phrase("Payment Status: " + payment.getStatus(), valueFont));
			pCell1.setBorder(Rectangle.NO_BORDER);
			paymentTable.addCell(pCell1);
			
			PdfPCell pCell2 = new PdfPCell(new Phrase("Amount Paid: \u20B9" + payment.getAmount(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new BaseColor(22, 163, 74))));
			pCell2.setBorder(Rectangle.NO_BORDER);
			pCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
			paymentTable.addCell(pCell2);
			
			document.add(paymentTable);
			
			document.add(new Paragraph(" "));
			document.add(new Paragraph(" "));
			Paragraph footer = new Paragraph("Important: Please carry a valid ID proof and report 15 mins before departure. Have a safe journey!", footerFont);
			footer.setAlignment(Element.ALIGN_CENTER);
			document.add(footer);

			document.close();
			return outputStream.toByteArray();

		} catch (Exception e) {
			throw new RuntimeException("Failed to generate ticket: " + e.getMessage());
		}
	}
}