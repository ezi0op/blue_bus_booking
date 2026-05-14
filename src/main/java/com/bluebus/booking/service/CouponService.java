package com.bluebus.booking.service;

import java.math.BigDecimal;
import java.util.List;

import com.bluebus.booking.entity.Coupon;

public interface CouponService {

	// Create coupon
	Coupon createCoupon(Coupon coupon);

	// Update coupon
	Coupon updateCoupon(Long couponId, Coupon coupon);

	// Delete coupon
	void deleteCoupon(Long couponId);

	// Get all coupons
	List<Coupon> getAllCoupons();

	// Apply coupon during booking/payment
	BigDecimal applyCoupon(String couponCode, BigDecimal bookingAmount);
}