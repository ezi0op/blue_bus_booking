package com.bluebus.booking.service;

public interface InvoiceService {

	byte[] generateInvoice(Long bookingId);

}