package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

	@org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user", "trip", "trip.route", "bookingItems", "bookingItems.seat" })
	java.util.Optional<Booking> findById(Long id);

	@org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user", "trip", "trip.route", "bookingItems", "bookingItems.seat" })
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

	@Query(value = """
			SELECT
			    (SELECT COUNT(*) FROM users) as totalUsers,
			    (SELECT COUNT(*) FROM bookings) as totalBookings,
			    (SELECT COUNT(*) FROM trips) as totalTrips,
			    (SELECT COUNT(*) FROM buses) as totalBuses,
			    (SELECT COUNT(DISTINCT bus_operator_id) FROM buses) as totalBusOperators,
			    (SELECT COUNT(*) FROM bookings WHERE status = 'CANCELLED') as cancelledBookings,
			    (SELECT COUNT(*) FROM payments WHERE status = 'SUCCESS') as successfulPayments,
			    (SELECT COUNT(*) FROM payments WHERE status = 'PENDING') as pendingPayments,
			    (SELECT COUNT(*) FROM payments WHERE status = 'CANCELLED') as totalRefunds,
			    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'SUCCESS') as totalRevenue,
			    (SELECT COALESCE(SUM(discount_applied), 0) FROM payments) as totalDiscountGiven,
			    (SELECT used_coupon_code FROM payments WHERE used_coupon_code IS NOT NULL GROUP BY used_coupon_code ORDER BY COUNT(*) DESC LIMIT 1) as mostUsedCoupon
			""", nativeQuery = true)
	java.util.Map<String, Object> getQuickDashboardSummary();

}
