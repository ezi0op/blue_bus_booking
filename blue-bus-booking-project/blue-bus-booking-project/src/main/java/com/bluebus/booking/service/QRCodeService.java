package com.bluebus.booking.service;

public interface QRCodeService {

	byte[] generateQRCode(String text, int width, int height);

	byte[] generateTicketQRCode(Long bookingId);

}