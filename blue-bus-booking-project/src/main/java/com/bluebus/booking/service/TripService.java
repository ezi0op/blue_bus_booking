package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.dto.TripSearchRequest;
import com.bluebus.booking.entity.Trip;

public interface TripService {
	Trip createTrip(Trip trip);

	Trip getTripById(Long id);

	List<Trip> getTripsByRoute(Long routeId);

	Trip updateTrip(Long id, Trip trip);

	Trip cancelTrip(Long id);

	/*
	 * Admin trip cancellation with refund + notifications
	 */
	void cancelTripByAdmin(Long tripId, String reason);

	List<Trip> searchTrips(TripSearchRequest request, int page, int size, String sortBy, String direction);

	List<Trip> getAllTrips();
}
