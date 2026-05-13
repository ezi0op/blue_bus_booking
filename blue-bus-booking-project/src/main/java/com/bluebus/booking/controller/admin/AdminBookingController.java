package com.bluebus.booking.controller.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BookingResponseDTO;
import com.bluebus.booking.dto.PassengerResponseDTO;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.service.BookingService;

@RestController
@RequestMapping("/api/admin/bookings")
public class AdminBookingController {

	@Autowired
	private BookingService bookingService;

	// Booking controlles for admin

	@GetMapping
	public ApiResponse<List<BookingResponseDTO>> getAllBookings() {

		List<Booking> bookings = bookingService.getAllBookings();

		List<BookingResponseDTO> response = new ArrayList<>();

		for (Booking b : bookings) {
			response.add(mapToDTO(b));
		}

		return new ApiResponse<>(true, "All bookings fetched", response);
	}

	@GetMapping("/{id}")
	public ApiResponse<BookingResponseDTO> getBooking(@PathVariable Long id) {

		Booking booking = bookingService.getBookingById(id);

		return new ApiResponse<>(true, "Booking fetched", mapToDTO(booking));
	}

	@PutMapping("/{id}/cancel")
	public ApiResponse<BookingResponseDTO> cancel(@PathVariable Long id) {

		Booking booking = bookingService.cancelBooking(id, true);

		return new ApiResponse<>(true, "Booking cancelled by admin (Full Refund Issued)", mapToDTO(booking));
	}

	// 🔁 Admin booking MAPPER
	private BookingResponseDTO mapToDTO(Booking booking) {

		List<PassengerResponseDTO> passengers = new ArrayList<>();

		if (booking.getBookingItems() != null) {

			for (BookingItem item : booking.getBookingItems()) {

				passengers.add(PassengerResponseDTO.builder().seatId(item.getSeat().getId())
						.seatNumber(item.getSeat().getSeatNumber()).name(item.getPassengerName())
						.age(item.getPassengerAge()).gender(item.getPassengerGender()).build());
			}
		}

		return BookingResponseDTO.builder().id(booking.getId()).userId(booking.getUser().getId())
				.tripId(booking.getTrip().getId()).bookingReference(booking.getBookingReference())
				.status(booking.getStatus()).totalAmount(booking.getTotalAmount()).finalAmount(booking.getFinalAmount())
				.bookingTime(booking.getBookingTime()).passengers(passengers).build();
	}
}
