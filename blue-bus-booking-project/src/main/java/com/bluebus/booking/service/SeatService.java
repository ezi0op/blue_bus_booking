package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.Seat;

public interface SeatService {
	Seat createSeat(Seat seat);

	List<Seat> getSeatsByBus(Long busId);

	Seat getSeatById(Long id);

	Seat deactivateSeat(Long id);
}
