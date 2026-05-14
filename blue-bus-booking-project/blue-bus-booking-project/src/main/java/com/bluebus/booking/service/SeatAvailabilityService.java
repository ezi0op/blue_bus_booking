package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.dto.SeatLayoutDTO;
import com.bluebus.booking.entity.SeatAvailability;

public interface SeatAvailabilityService {
	List<SeatAvailability> getSeatsByTrip(Long tripId);

	SeatAvailability lockSeat(Long tripId, Long seatId);

	SeatAvailability unlockSeat(Long tripId, Long seatId);

	SeatAvailability confirmSeatBooking(Long tripId, Long seatId);

	void releaseExpiredLocks();

	List<List<SeatLayoutDTO>> getSeatLayout(Long tripId);
}
