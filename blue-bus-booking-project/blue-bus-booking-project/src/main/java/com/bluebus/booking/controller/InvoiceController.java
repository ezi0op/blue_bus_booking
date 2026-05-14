package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

	@Autowired
	private InvoiceService invoiceService;

	@GetMapping("/{bookingId}")
	public ResponseEntity<byte[]> generateInvoice(@PathVariable Long bookingId) {

		byte[] pdf = invoiceService.generateInvoice(bookingId);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice_" + bookingId + ".pdf")
				.contentType(MediaType.APPLICATION_PDF).body(pdf);
	}
}