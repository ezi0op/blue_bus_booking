package com.bluebus.booking.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.service.QRCodeService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class QRCodeServiceImpl implements QRCodeService {

	@Autowired
	private BookingRepository bookingRepository;

	@Override
	public byte[] generateQRCode(String text, int width, int height) {

		try {
			QRCodeWriter qrCodeWriter = new QRCodeWriter();

			BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

			MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

			return outputStream.toByteArray();

		} catch (WriterException | java.io.IOException e) {
			throw new RuntimeException("Failed to generate QR Code: " + e.getMessage());
		}
	}

	@Override
	public byte[] generateTicketQRCode(Long bookingId) {
		Booking booking=bookingRepository.findById(bookingId).orElseThrow(()->new RuntimeException("Booking not found"));
		
		String seatNumbers=booking.getBookingItems().stream().map(item->item.getSeat().getSeatNumber()).collect(Collectors.joining(", "));
		
		String qrText="BOOKING_ID"+ "|REF:" + booking.getBookingReference()
		+ "|USER:" + booking.getUser().getId()
		+ "|TRIP:" + booking.getTrip().getId()
		+ "|SEATS:" + seatNumbers
		+ "|STATUS:" + booking.getStatus();
		
		
		
		
		
		return generateQRCode(qrText, 300, 300);
	}
}