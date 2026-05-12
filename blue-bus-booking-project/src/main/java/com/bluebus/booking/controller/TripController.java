package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.TripDTO;
import com.bluebus.booking.dto.TripSearchRequest;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.service.TripService;

@RestController
@RequestMapping("/api/trips")
public class TripController {

	@Autowired
	private TripService tripService;

	@PostMapping("/search")
	public ApiResponse<List<TripDTO>> searchTrips(@RequestBody TripSearchRequest request,
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "price") String sortBy, @RequestParam(defaultValue = "asc") String direction) {

		List<Trip> trips = tripService.searchTrips(request, page, size, sortBy, direction);

		List<TripDTO> response = new ArrayList<>();

		for (Trip t : trips) {
			response.add(mapToDTO(t));
		}

		return new ApiResponse<>(true, "Trips found", response);
	}

	// 🔍 GET BY ID
	@GetMapping("/{id}")
	public ApiResponse<TripDTO> getTrip(@PathVariable Long id) {

		Trip trip = tripService.getTripById(id);

		return new ApiResponse<>(true, "Trip fetched", mapToDTO(trip));
	}

	// 🔍 GET BY ROUTE
	@GetMapping("/route/{routeId}")
	public ApiResponse<List<TripDTO>> getByRoute(@PathVariable Long routeId) {

		List<Trip> trips = tripService.getTripsByRoute(routeId);

		List<TripDTO> response = new ArrayList<>();

		for (Trip t : trips) {
			response.add(mapToDTO(t));
		}

		return new ApiResponse<>(true, "Trips fetched", response);
	}

	// 🔁 MAPPER
	private TripDTO mapToDTO(Trip trip) {
		return TripDTO.builder().id(trip.getId()).routeId(trip.getRoute().getId()).busId(trip.getBus().getId())
				.journeyDate(trip.getJourneyDate()).departureTime(trip.getDepartureTime())
				.arrivalTime(trip.getArrivalTime()).price(trip.getPrice()).status(trip.getStatus())
				.totalSeats(trip.getTotalSeats()).availableSeats(trip.getAvailableSeats())
				.bookedSeats(trip.getBookedSeats()).rating(trip.getRating()).cancelledAt(trip.getCancelledAt())
				.operator(mapOperatorToDTO(trip.getBus().getOperator()))
				.build();
	}

	private com.bluebus.booking.dto.BusOperatorDTO mapOperatorToDTO(com.bluebus.booking.entity.BusOperator op) {
		if (op == null)
			return null;
		return com.bluebus.booking.dto.BusOperatorDTO.builder().id(op.getId()).name(op.getName())
				.contactEmail(op.getContactEmail()).contactPhone(op.getContactPhone())
				.licenseNumber(op.getLicenseNumber()).rating(op.getRating()).isActive(op.getIsActive()).build();
	}

}
