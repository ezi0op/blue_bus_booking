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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class QRCodeServiceImpl implements QRCodeService {

	@Autowired
	private BookingRepository bookingRepository;

	@Override
	public byte[] generateQRCode(String text, int width, int height) {
		log.info("generateQRCode called with text: {}, width: {}, height: {}", text, width, height);
		try {
			QRCodeWriter qrCodeWriter = new QRCodeWriter();

			BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

			MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

			return outputStream.toByteArray();

		} catch (WriterException | java.io.IOException e) {
			log.error("Failed to generate QR Code for text: {}", text, e);
			throw new RuntimeException("Failed to generate QR Code: " + e.getMessage());
		} catch (Exception e) {
			log.error("Error in generateQRCode for text: {}", text, e);
			throw e;
		}
	}

	@Override
	public byte[] generateTicketQRCode(Long bookingId) {
		log.info("generateTicketQRCode called with bookingId: {}", bookingId);
		try {
			Booking booking=bookingRepository.findById(bookingId).orElseThrow(()->new RuntimeException("Booking not found"));
			
			String seatNumbers=booking.getBookingItems().stream().map(item->item.getSeat().getSeatNumber()).collect(Collectors.joining(", "));
			
			String qrText="BOOKING_ID"+ "|REF:" + booking.getBookingReference()
			+ "|USER:" + booking.getUser().getId()
			+ "|TRIP:" + booking.getTrip().getId()
			+ "|SEATS:" + seatNumbers
			+ "|STATUS:" + booking.getStatus();
			
			return generateQRCode(qrText, 300, 300);
		} catch (Exception e) {
			log.error("Error in generateTicketQRCode with bookingId: {}", bookingId, e);
			throw e;
		}
	}
}