package com.bluebus.booking.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BookingItemDTO;
import com.bluebus.booking.dto.BusDTO;
import com.bluebus.booking.dto.OperatorDashboardDTO;
import com.bluebus.booking.dto.TripDTO;
import com.bluebus.booking.service.OperatorService;

@RestController
@RequestMapping("/api/operator")
@PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
public class OperatorController {

	@Autowired
	private OperatorService operatorService;

	@GetMapping("/dashboard/{operatorId}")
	public ApiResponse<OperatorDashboardDTO> getDashboardStats(@PathVariable Long operatorId) {
		OperatorDashboardDTO stats = operatorService.getDashboardStats(operatorId);
		return new ApiResponse<>(true, "Dashboard stats fetched successfully", stats);
	}

	@GetMapping("/buses/{operatorId}")
	public ApiResponse<List<BusDTO>> getMyBuses(@PathVariable Long operatorId) {
		List<BusDTO> buses = operatorService.getMyBuses(operatorId);
		return new ApiResponse<>(true, "Fleet fetched successfully", buses);
	}

	@PostMapping("/bus")
	public ApiResponse<BusDTO> addBus(
			@RequestParam Long operatorId, 
			@RequestBody BusDTO busDTO) {
		BusDTO savedBus = operatorService.addBus(operatorId, busDTO);
		return new ApiResponse<>(true, "Bus added to fleet successfully", savedBus);
	}

	@GetMapping("/trips/{operatorId}")
	public ApiResponse<List<TripDTO>> getMyTrips(@PathVariable Long operatorId) {
		List<TripDTO> trips = operatorService.getMyTrips(operatorId);
		return new ApiResponse<>(true, "Trips fetched successfully", trips);
	}

	@PostMapping("/trip")
	public ApiResponse<TripDTO> scheduleTrip(
			@RequestParam Long operatorId, 
			@RequestBody TripDTO tripDTO) {
		TripDTO savedTrip = operatorService.scheduleTrip(operatorId, tripDTO);
		return new ApiResponse<>(true, "Trip scheduled successfully", savedTrip);
	}

	@PutMapping("/trip/{tripId}/status")
	public ApiResponse<TripDTO> updateTripStatus(
			@PathVariable Long tripId, 
			@RequestParam Long operatorId,
			@RequestParam String status) {
		TripDTO updatedTrip = operatorService.updateTripStatus(tripId, operatorId, status);
		return new ApiResponse<>(true, "Trip status updated to " + status, updatedTrip);
	}

	@GetMapping("/manifest/{tripId}")
	public ApiResponse<List<BookingItemDTO>> getPassengerManifest(
			@PathVariable Long tripId, 
			@RequestParam Long operatorId) {
		List<BookingItemDTO> manifest = operatorService.getPassengerManifest(tripId, operatorId);
		return new ApiResponse<>(true, "Passenger manifest fetched successfully", manifest);
	}

	@GetMapping("/earnings/{operatorId}")
	public ApiResponse<BigDecimal> getEarnings(
			@PathVariable Long operatorId, 
			@RequestParam(defaultValue = "MONTHLY") String period) {
		BigDecimal earnings = operatorService.getEarningsByPeriod(operatorId, period);
		return new ApiResponse<>(true, "Earnings for " + period + " fetched successfully", earnings);
	}
}
