package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.SeatPreferenceDTO;
import com.bluebus.booking.dto.enums.SeatType;
import com.bluebus.booking.service.SeatPreferenceService;

@RestController
@RequestMapping("/api/seat-preference")
public class SeatPreferenceController {

	@Autowired
	private SeatPreferenceService seatPreferenceService;

	@GetMapping("/{userId}")
	public ApiResponse<SeatPreferenceDTO> getPreference(@PathVariable Long userId) {

		SeatPreferenceDTO preference = seatPreferenceService.getPreference(userId);

		return new ApiResponse<>(true, "Seat preference fetched successfully", preference);
	}

	@GetMapping("/{userId}/suggest")
	public ApiResponse<SeatType> suggestSeatType(@PathVariable Long userId) {

		SeatType suggestedSeat = seatPreferenceService.suggestSeatType(userId);

		return new ApiResponse<>(true, "Suggested seat type fetched successfully", suggestedSeat);
	}

	@GetMapping("/{userId}/sync")
	public ApiResponse<String> syncHistory(@PathVariable Long userId) {

		seatPreferenceService.syncAllPastBookings(userId);

		return new ApiResponse<>(true, "AI Seat Insights synced from history", "SUCCESS");
	}
}