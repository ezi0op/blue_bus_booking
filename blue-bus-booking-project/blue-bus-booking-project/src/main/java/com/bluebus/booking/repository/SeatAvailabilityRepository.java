package com.bluebus.booking.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.entity.SeatAvailability;

import jakarta.persistence.LockModeType;

public interface SeatAvailabilityRepository extends JpaRepository<SeatAvailability, Long> {

	List<SeatAvailability> findByTripId(Long id);

	List<SeatAvailability> findByIsLockedTrueAndLockExpiryTimeBefore(LocalDateTime now);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("Select s From  SeatAvailability s Where s.trip.id= :tripId and s.seat.id= :seatId ")
	Optional<SeatAvailability> findWithLock(Long tripId, Long seatId);

	Optional<SeatAvailability> findByTripIdAndSeatId(Long tripId, Long seatId);

}
