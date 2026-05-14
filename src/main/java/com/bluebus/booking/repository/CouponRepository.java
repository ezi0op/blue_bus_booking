package com.bluebus.booking.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.Coupon;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

	Optional<Coupon> findByCouponCode(String couponCode);

	boolean existsByCouponCode(String couponCode);

	List<Coupon> findByExpiryDateBeforeAndIsActiveTrue(LocalDateTime now);
}
