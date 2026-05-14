package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.SeatDTO;
import com.bluebus.booking.entity.Seat;
import com.bluebus.booking.service.SeatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/seats")
public class AdminSeatController {

	@Autowired
	private SeatService seatService;

	// ➕ CREATE
	@PostMapping
	public ApiResponse<SeatDTO> create(@Valid @RequestBody Seat seat) {

		Seat saved = seatService.createSeat(seat);

		return new ApiResponse<>(true, "Seat created", mapToDTO(saved));
	}

	// ❌ DEACTIVATE
	@PutMapping("/{id}/deactivate")
	public ApiResponse<SeatDTO> deactivate(@PathVariable Long id) {

		Seat seat = seatService.deactivateSeat(id);

		return new ApiResponse<>(true, "Seat deactivated", mapToDTO(seat));
	}

	// 🔁 MAPPER
	private SeatDTO mapToDTO(Seat seat) {
		return SeatDTO.builder().id(seat.getId()).seatNumber(seat.getSeatNumber()).seatType(seat.getSeatType())
				.rowNumber(seat.getRowNumber()).columnNumber(seat.getColumnNumber()).isWindow(seat.getIsWindow())
				.isAisle(seat.getIsAisle()).isActive(seat.getIsActive()).busId(seat.getBus().getId()).build();
	}
}