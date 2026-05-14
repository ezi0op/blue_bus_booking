package com.bluebus.booking.service;

import java.math.BigDecimal;
import java.util.List;

import com.bluebus.booking.dto.BookingItemDTO;
import com.bluebus.booking.dto.BusDTO;
import com.bluebus.booking.dto.OperatorDashboardDTO;
import com.bluebus.booking.dto.TripDTO;

public interface OperatorService {
	// Dashboard Stats
	OperatorDashboardDTO getDashboardStats(Long operatorId);

	// Fleet Management
	List<BusDTO> getMyBuses(Long operatorId);

	BusDTO addBus(Long operatorId, BusDTO busDTO);

	// Trip Management
	List<TripDTO> getMyTrips(Long operatorId);
	
	TripDTO scheduleTrip(Long operatorId, TripDTO tripDTO);

	TripDTO updateTripStatus(Long tripId, Long operatorId, String status);

	// Booking & Passengers
	List<BookingItemDTO> getBookingsForOperator(Long operatorId);

	List<BookingItemDTO> getPassengerManifest(Long tripId, Long operatorId);

	// Finance
	BigDecimal getEarningsByPeriod(Long operatorId, String period); // e.g., "DAILY", "MONTHLY"
}
