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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SeatServiceImpl implements SeatService {

	@Autowired
	private SeatRepository seatRepository;

	@Autowired
	private BusRepository busRepository;

	@Override
	public Seat createSeat(Seat seat) {
		log.info("createSeat called with seat: {}", seat);
		try {
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
		} catch (Exception e) {
			log.error("Error in createSeat with seat: {}", seat, e);
			throw e;
		}
	}

	@Override
	public List<Seat> getSeatsByBus(Long busId) {
		log.info("getSeatsByBus called with busId: {}", busId);
		try {
			return seatRepository.findByBusIdAndIsActiveTrue(busId);
		} catch (Exception e) {
			log.error("Error in getSeatsByBus with busId: {}", busId, e);
			throw e;
		}
	}

	@Override
	public Seat getSeatById(Long id) {
		log.info("getSeatById called with id: {}", id);
		try {
			return seatRepository.findById(id).orElseThrow(() -> new RuntimeException("Seat not found"));
		} catch (Exception e) {
			log.error("Error in getSeatById with id: {}", id, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Seat deactivateSeat(Long id) {
		log.info("deactivateSeat called with id: {}", id);
		try {
			Seat seat = getSeatById(id);

			// Toggle status instead of just deactivating
			seat.setIsActive(!seat.getIsActive());

			return seatRepository.save(seat);
		} catch (Exception e) {
			log.error("Error in deactivateSeat with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<Seat> getAllSeats() {
		log.info("getAllSeats called");
		try {
			return seatRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllSeats", e);
			throw e;
		}
	}

}
