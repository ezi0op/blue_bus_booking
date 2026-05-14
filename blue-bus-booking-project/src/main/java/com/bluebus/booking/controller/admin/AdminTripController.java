package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.AdminTripCancellationRequestDTO;
import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.TripDTO;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.service.TripService;

@RestController
@RequestMapping("/api/admin/trips")
public class AdminTripController {

	@Autowired
	private TripService tripService;

	// ➕ CREATE
	@PostMapping
	public ApiResponse<TripDTO> create(@RequestBody Trip trip) {

		Trip saved = tripService.createTrip(trip);

		return new ApiResponse<>(true, "Trip created", mapToDTO(saved));
	}

	// ✏️ UPDATE
	@PutMapping("/{id}")
	public ApiResponse<TripDTO> update(@PathVariable Long id, @RequestBody Trip trip) {

		Trip updated = tripService.updateTrip(id, trip);

		return new ApiResponse<>(true, "Trip updated", mapToDTO(updated));
	}

	// ❌ CANCEL
	@PutMapping("/{id}/cancel")
	public ApiResponse<TripDTO> cancel(@PathVariable Long id) {

		Trip trip = tripService.cancelTrip(id);

		return new ApiResponse<>(true, "Trip cancelled", mapToDTO(trip));
	}

	@PutMapping("/{id}/admin-cancel")
	public ApiResponse<String> adminCancelTrip(@PathVariable Long id, @RequestBody AdminTripCancellationRequestDTO reason) {

		tripService.cancelTripByAdmin(id, reason.getReason());

		return new ApiResponse<>(true, "Trip cancelled successfully with refund + notification", null);
	}

	// 🔁 MAPPER
	private TripDTO mapToDTO(Trip trip) {
		return TripDTO.builder().id(trip.getId())
				.routeId(trip.getRoute().getId())
				.source(trip.getRoute().getSource())
				.destination(trip.getRoute().getDestination())
				.busId(trip.getBus().getId())
				.busName(trip.getBus().getBusNumber())
				.busType(trip.getBus().getBusType())
				.journeyDate(trip.getJourneyDate()).departureTime(trip.getDepartureTime())
				.arrivalTime(trip.getArrivalTime().toLocalTime()).price(trip.getPrice()).status(trip.getStatus()).build();
	}
}