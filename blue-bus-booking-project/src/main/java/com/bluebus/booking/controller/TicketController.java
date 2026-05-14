package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

	@Autowired
	private TicketService ticketService;

	@GetMapping("/{bookingId}")
	public ResponseEntity<byte[]> generateTicket(@PathVariable Long bookingId) {

		byte[] pdf = ticketService.generateTicket(bookingId);

		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ticket_" + bookingId + ".pdf")
				.contentType(MediaType.APPLICATION_PDF).body(pdf);
	}
	
	
	
	
	
}