package com.bluebus.booking.repository;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.dto.enums.PaymentStatus;
import com.bluebus.booking.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

	Optional<Payment> findTopByBookingIdAndStatusOrderByCreatedAtDesc(Long bookingId, PaymentStatus status);

	Long countByStatus(PaymentStatus status);

	@Query("""
			SELECT COALESCE(SUM(p.amount), 0)
			FROM Payment p
			WHERE p.status = 'SUCCESS'
			""")
	BigDecimal getTotalRevenue();

	@Query("""
				SELECT p.usedCouponCode
				FROM Payment p
				WHERE p.usedCouponCode IS NOT NULL
				GROUP BY p.usedCouponCode
				ORDER BY COUNT(p.id) DESC
				LIMIT 1
			""")
	String findMostUsedCoupon();

	@Query("""
				SELECT COALESCE(SUM(p.discountApplied), 0)
				FROM Payment p
			""")
	BigDecimal getTotalDiscountGiven();

}
