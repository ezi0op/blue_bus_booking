package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.SeatLayoutDTO;
import com.bluebus.booking.entity.SeatAvailability;
import com.bluebus.booking.repository.SeatAvailabilityRepository;
import com.bluebus.booking.service.SeatAvailabilityService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SeatAvailabilityServiceImpl implements SeatAvailabilityService {

	@Autowired
	private SeatAvailabilityRepository seatAvailabilityRepository;

	@Override
	public List<SeatAvailability> getSeatsByTrip(Long tripId) {
		log.info("getSeatsByTrip called with tripId: {}", tripId);
		try {
			return seatAvailabilityRepository.findByTripId(tripId);
		} catch (Exception e) {
			log.error("Error in getSeatsByTrip with tripId: {}", tripId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public SeatAvailability lockSeat(Long tripId, Long seatId) {
		log.info("lockSeat called with tripId: {}, seatId: {}", tripId, seatId);
		try {
			SeatAvailability seat = seatAvailabilityRepository.findWithLock(tripId, seatId)
					.orElseThrow(() -> new RuntimeException("Seat not found"));

			if (seat.getIsBooked()) {
				throw new RuntimeException("Seat already booked");

			}
			if (seat.getIsLocked()) {
				if (seat.getLockExpiryTime() != null && seat.getLockExpiryTime().isAfter(LocalDateTime.now())) {
					throw new RuntimeException("Seat already locked");
				}

				seat.setIsLocked(false);
				seat.setLockTime(null);
				seat.setLockExpiryTime(null);
			}

			seat.setIsLocked(true);

			seat.setLockTime(LocalDateTime.now());
			seat.setLockExpiryTime(LocalDateTime.now().plusMinutes(5));

			return seatAvailabilityRepository.save(seat);
		} catch (Exception e) {
			log.error("Error in lockSeat with tripId: {}, seatId: {}", tripId, seatId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public SeatAvailability unlockSeat(Long tripId, Long seatId) {
		log.info("unlockSeat called with tripId: {}, seatId: {}", tripId, seatId);
		try {
			SeatAvailability seat = seatAvailabilityRepository.findByTripIdAndSeatId(tripId, seatId)
					.orElseThrow(() -> new RuntimeException("Seat not found"));

			if (seat.getIsBooked()) {
				throw new RuntimeException("Cannot unlock a booked seat");
			}
			if (!seat.getIsLocked()) {
				throw new RuntimeException("Seat is not locked");
			}
			seat.setIsLocked(false);
			seat.setLockTime(null);
			seat.setLockExpiryTime(null);

			return seatAvailabilityRepository.save(seat);
		} catch (Exception e) {
			log.error("Error in unlockSeat with tripId: {}, seatId: {}", tripId, seatId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public SeatAvailability confirmSeatBooking(Long tripId, Long seatId) {
		log.info("confirmSeatBooking called with tripId: {}, seatId: {}", tripId, seatId);
		try {
			throw new RuntimeException("Use BookingService to confirm booking");
		} catch (Exception e) {
			log.error("Error in confirmSeatBooking with tripId: {}, seatId: {}", tripId, seatId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public void releaseExpiredLocks() {
		log.info("releaseExpiredLocks called");
		try {
			List<SeatAvailability> expiredSeats = seatAvailabilityRepository
					.findByIsLockedTrueAndLockExpiryTimeBefore(LocalDateTime.now());

			for (SeatAvailability seat : expiredSeats) {
				seat.setIsLocked(false);
				seat.setLockTime(null);
				seat.setLockExpiryTime(null);
			}

			seatAvailabilityRepository.saveAll(expiredSeats);
		} catch (Exception e) {
			log.error("Error in releaseExpiredLocks", e);
			throw e;
		}

	}

	@Override
	public List<List<SeatLayoutDTO>> getSeatLayout(Long tripId) {
		log.info("getSeatLayout called with tripId: {}", tripId);
		try {
			List<SeatAvailability> seats = seatAvailabilityRepository.findByTripId(tripId);

			Map<Integer, List<SeatLayoutDTO>> map = new TreeMap<>();

			for (SeatAvailability s : seats) {

				int row = s.getSeat().getRowNumber();

				String sNum = s.getSeat().getSeatNumber();
				com.bluebus.booking.dto.enums.DeckType deck = sNum.startsWith("U") 
						? com.bluebus.booking.dto.enums.DeckType.UPPER 
						: com.bluebus.booking.dto.enums.DeckType.LOWER;

				SeatLayoutDTO dto = SeatLayoutDTO.builder()
						.id(s.getId())
						.seatId(s.getSeat().getId())
						.seatNumber(sNum)
						.isBooked(s.getIsBooked())
						.seatType(s.getSeat().getSeatType().name())
						.rowNumber(s.getSeat().getRowNumber())
						.columnNumber(s.getSeat().getColumnNumber())
						.deckType(deck)
						.build();

				map.computeIfAbsent(row, k -> new ArrayList<>()).add(dto);
			}

			return new ArrayList<>(map.values());
		} catch (Exception e) {
			log.error("Error in getSeatLayout with tripId: {}", tripId, e);
			throw e;
		}
	}

}
