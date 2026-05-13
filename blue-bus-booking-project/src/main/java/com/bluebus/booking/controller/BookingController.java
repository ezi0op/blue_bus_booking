package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BookingResponseDTO;
import com.bluebus.booking.dto.CreateBookingRequest;
import com.bluebus.booking.dto.PassengerResponseDTO;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

	@Autowired
	private BookingService bookingService;

	@PostMapping
	public ApiResponse<BookingResponseDTO> createBooking(@Valid @RequestBody CreateBookingRequest request) {
		Booking booking = bookingService.createBooking(request);
		return new ApiResponse<>(true, "Booking created", mapToDTO(booking));
	}

	@GetMapping("/{id}")
	public ApiResponse<BookingResponseDTO> getBooking(@PathVariable Long id) {
		Booking booking = bookingService.getBookingById(id);
		return new ApiResponse<>(true, "Booking fetched", mapToDTO(booking));
	}

	@GetMapping("/user/{userId}")
	public ApiResponse<List<BookingResponseDTO>> getByUser(@PathVariable Long userId) {

		List<Booking> bookings = bookingService.getBookingsByUser(userId);

		List<BookingResponseDTO> response = new ArrayList<>();

		for (Booking b : bookings) {
			response.add(mapToDTO(b));
		}

		return new ApiResponse<>(true, "Bookings fetched", response);
	}

	@PutMapping("/{id}/confirm")
	public ApiResponse<BookingResponseDTO> confirm(@PathVariable Long id) {

		Booking booking = bookingService.confirmBooking(id);

		return new ApiResponse<>(true, "Booking confirmed", mapToDTO(booking));
	}

	@PutMapping("/{id}/cancel")
	public ApiResponse<BookingResponseDTO> cancel(@PathVariable Long id) {

		Booking booking = bookingService.cancelBooking(id, false);

		return new ApiResponse<>(true, "Booking cancelled", mapToDTO(booking));
	}

	private BookingResponseDTO mapToDTO(Booking booking) {

		List<PassengerResponseDTO> passengers = new ArrayList<>();

		if (booking.getBookingItems() != null) {
			for (BookingItem item : booking.getBookingItems()) {

				PassengerResponseDTO p = PassengerResponseDTO.builder().seatId(item.getSeat().getId())
						.seatNumber(item.getSeat().getSeatNumber()).name(item.getPassengerName())
						.age(item.getPassengerAge()).gender(item.getPassengerGender()).build();

				passengers.add(p);
			}
		}

		return BookingResponseDTO.builder().id(booking.getId()).userId(booking.getUser().getId())
				.tripId(booking.getTrip().getId()).bookingReference(booking.getBookingReference())
				.status(booking.getStatus()).totalAmount(booking.getTotalAmount()).finalAmount(booking.getFinalAmount())
				.bookingTime(booking.getBookingTime())
				.contactEmail(booking.getContactEmail())
				.contactPhone(booking.getContactPhone())
				.passengers(passengers) // ✅ UPDATED
				.build();
	}

}
