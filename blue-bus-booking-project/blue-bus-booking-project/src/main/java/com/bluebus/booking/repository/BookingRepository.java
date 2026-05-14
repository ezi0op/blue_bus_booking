package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByUserId(Long userId);

	Long countByStatus(BookingStatus status);

	@Query("""
			SELECT CONCAT(
				t.route.source,
				' → ',
				t.route.destination
			)
			FROM Booking b
			JOIN b.trip t
			GROUP BY t.route.source, t.route.destination
			ORDER BY COUNT(b.id) DESC
			LIMIT 1
			""")
	String findTopBookedRoute();

	List<Booking> findByTripId(Long tripId);

	java.util.Optional<Booking> findByBookingReference(String bookingReference);

}
