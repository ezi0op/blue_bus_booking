package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.SeatDTO;
import com.bluebus.booking.entity.Seat;
import com.bluebus.booking.service.SeatService;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

	@Autowired
	private SeatService seatService;

	@GetMapping("/bus/{busId}")
	public ApiResponse<List<SeatDTO>> getSeatsByBus(@PathVariable Long busId) {
		List<Seat> seats = seatService.getSeatsByBus(busId);

		List<SeatDTO> response = new ArrayList<>();

		for (Seat s : seats) {
			response.add(mapToDTO(s));
		}

		return new ApiResponse<>(true, "Seats fetched", response);

	}

	// 🔍 GET BY ID
	@GetMapping("/{id}")
	public ApiResponse<SeatDTO> getSeat(@PathVariable Long id) {

		Seat seat = seatService.getSeatById(id);

		return new ApiResponse<>(true, "Seat fetched", mapToDTO(seat));
	}

	// 🔁 MAPPER
	private SeatDTO mapToDTO(Seat seat) {
		return SeatDTO.builder().id(seat.getId()).seatNumber(seat.getSeatNumber()).seatType(seat.getSeatType())
				.rowNumber(seat.getRowNumber()).columnNumber(seat.getColumnNumber()).isWindow(seat.getIsWindow())
				.isAisle(seat.getIsAisle()).isActive(seat.getIsActive()).busId(seat.getBus().getId()).build();
	}

}
