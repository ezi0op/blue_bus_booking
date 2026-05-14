package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.service.QRCodeService;

@RestController
@RequestMapping("/api/ticket")
public class QRCodeController {

	@Autowired
	private QRCodeService qrCodeService;

	@GetMapping("/qr/{bookingId}")
	public ResponseEntity<byte[]> getTicketQRCode(@PathVariable Long bookingId) {

		byte[] qrCode = qrCodeService.generateTicketQRCode(bookingId);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=ticket_qr_" + bookingId + ".png")
				.contentType(MediaType.IMAGE_PNG).body(qrCode);
	}
}