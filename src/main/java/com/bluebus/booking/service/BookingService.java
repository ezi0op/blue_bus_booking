package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.dto.CreateBookingRequest;
import com.bluebus.booking.entity.Booking;

public interface BookingService {
	Booking createBooking(CreateBookingRequest request);

	Booking getBookingById(Long id);

	List<Booking> getBookingsByUser(Long userId);

	Booking confirmBooking(Long bookingId);

	Booking cancelBooking(Long bookingId, boolean isFullRefund);

	String generateBookingReference();

	List<Booking> getAllBookings();

	Booking getBookingByReference(String reference);
}
