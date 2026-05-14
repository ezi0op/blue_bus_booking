package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.entity.Seat;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.repository.SeatRepository;
import com.bluebus.booking.service.SeatService;

@Service
public class SeatServiceImpl implements SeatService {

	@Autowired
	private SeatRepository seatRepository;

	@Autowired
	private BusRepository busRepository;

	@Override
	public Seat createSeat(Seat seat) {

		if (seat.getBus() == null || seat.getBus().getId() == null) {
			throw new RuntimeException("Bus is required");
		}

		Bus bus = busRepository.findById(seat.getBus().getId())
				.orElseThrow(() -> new RuntimeException("Bus not found"));

		if (seatRepository.existsByBusIdAndSeatNumber(bus.getId(), seat.getSeatNumber())) {
			throw new RuntimeException("Seat already exists");
		}
		seat.setBus(bus);
		return seatRepository.save(seat);
	}

	@Override
	public List<Seat> getSeatsByBus(Long busId) {

		return seatRepository.findByBusIdAndIsActiveTrue(busId);
	}

	@Override
	public Seat getSeatById(Long id) {

		return seatRepository.findById(id).orElseThrow(() -> new RuntimeException("Seat not found"));
	}

	@Transactional
	@Override
	public Seat deactivateSeat(Long id) {
		Seat seat = getSeatById(id);

		// Toggle status instead of just deactivating
		seat.setIsActive(!seat.getIsActive());

		return seatRepository.save(seat);
	}

	@Override
	public List<Seat> getAllSeats() {
		return seatRepository.findAll();
	}

}
