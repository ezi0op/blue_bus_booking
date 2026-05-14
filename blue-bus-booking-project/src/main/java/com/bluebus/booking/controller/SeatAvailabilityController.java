package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.SeatAvailabilityDTO;
import com.bluebus.booking.dto.SeatLayoutDTO;
import com.bluebus.booking.entity.SeatAvailability;
import com.bluebus.booking.service.SeatAvailabilityService;

@RestController
@RequestMapping("/api/seat-availability")
public class SeatAvailabilityController {

	@Autowired
	private SeatAvailabilityService seatAvailabilityService;

	// 🔍 GET ALL SEATS BY TRIP
	@GetMapping("/trip/{tripId}")
	public ApiResponse<List<SeatAvailabilityDTO>> getSeats(@PathVariable Long tripId) {

		List<SeatAvailability> seats = seatAvailabilityService.getSeatsByTrip(tripId);
		List<SeatAvailabilityDTO> response = new ArrayList<>();

		for (SeatAvailability s : seats) {
			response.add(mapToDTO(s));
		}

		return new ApiResponse<>(true, "Seats fetched", response);
	}

	@GetMapping("/layout/trip/{tripId}")
	public ApiResponse<List<List<SeatLayoutDTO>>> getSeatLayout(@PathVariable Long tripId) {

		List<List<SeatLayoutDTO>> layout = seatAvailabilityService.getSeatLayout(tripId);

		return new ApiResponse<>(true, "Seat layout fetched", layout);
	}

	// 🔒 LOCK SEAT
	@PutMapping("/lock-trip/{tripId}/seat/{seatId}")
	public ApiResponse<SeatAvailabilityDTO> lockSeat(@PathVariable Long tripId, @PathVariable Long seatId) {

		SeatAvailability seat = seatAvailabilityService.lockSeat(tripId, seatId);

		return new ApiResponse<>(true, "Seat locked", mapToDTO(seat));
	}

	// 🔓 UNLOCK SEAT
	@PutMapping("/unlock-trip/{tripId}/seat/{seatId}")
	public ApiResponse<SeatAvailabilityDTO> unlockSeat(@PathVariable Long tripId, @PathVariable Long seatId) {

		SeatAvailability seat = seatAvailabilityService.unlockSeat(tripId, seatId);

		return new ApiResponse<>(true, "Seat unlocked", mapToDTO(seat));
	}

	// ✅ CONFIRM BOOKING
	@PutMapping("/confirm-trip/{tripId}/seat/{seatId}")
	public ApiResponse<SeatAvailabilityDTO> confirm(@PathVariable Long tripId, @PathVariable Long seatId) {

		SeatAvailability seat = seatAvailabilityService.confirmSeatBooking(tripId, seatId);

		return new ApiResponse<>(true, "Seat booked", mapToDTO(seat));
	}

	// 🔁 MAPPER
	private SeatAvailabilityDTO mapToDTO(SeatAvailability seat) {
		Long bookingId = (seat.getBooking() != null) ? seat.getBooking().getId() : null;
		return SeatAvailabilityDTO.builder().id(seat.getId()).tripId(seat.getTrip().getId())
				.seatId(seat.getSeat().getId()).bookingId(bookingId).isBooked(seat.getIsBooked())
				.isLocked(seat.getIsLocked()).lockExpiryTime(seat.getLockExpiryTime()).build();
	}
}