package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.service.SeatAvailabilityService;

@RestController
@RequestMapping("/api/admin/seat-availability")
public class AdminSeatAvailabilityController {

	@Autowired
	private SeatAvailabilityService seatAvailabilityService;

	// ♻ RELEASE EXPIRED LOCKS
	@PutMapping("/release-expired-locks")
	public ApiResponse<String> releaseExpiredLocks() {

		seatAvailabilityService.releaseExpiredLocks();

		return new ApiResponse<>(true, "Expired locks released", null);
	}
}