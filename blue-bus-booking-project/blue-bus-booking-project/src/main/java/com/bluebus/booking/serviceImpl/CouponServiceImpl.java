package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Coupon;
import com.bluebus.booking.repository.CouponRepository;
import com.bluebus.booking.service.CouponService;

@Service
public class CouponServiceImpl implements CouponService {

	@Autowired
	private CouponRepository couponRepository;

	@Override
	public Coupon createCoupon(Coupon coupon) {

		if (couponRepository.existsByCouponCode(coupon.getCouponCode())) {
			throw new RuntimeException("Coupon code already exists");
		}
		return couponRepository.save(coupon);
	}

	@Override
	public Coupon updateCoupon(Long couponId, Coupon coupon) {

		Coupon existingCoupon = couponRepository.findById(couponId)
				.orElseThrow(() -> new RuntimeException("Coupon not found"));

		existingCoupon.setCouponCode(coupon.getCouponCode());
		existingCoupon.setDescription(coupon.getDescription());
		existingCoupon.setDiscountAmount(coupon.getDiscountAmount());
		existingCoupon.setMinimumBookingAmount(coupon.getMinimumBookingAmount());
		existingCoupon.setExpiryDate(coupon.getExpiryDate());
		existingCoupon.setIsActive(coupon.getIsActive());

		return couponRepository.save(existingCoupon);
	}

	@Override
	public void deleteCoupon(Long couponId) {

		Coupon coupon = couponRepository.findById(couponId).orElseThrow(() -> new RuntimeException("Coupon not found"));

		couponRepository.delete(coupon);
	}

	@Override
	public List<Coupon> getAllCoupons() {
		return couponRepository.findAll();
	}

	@Override
	public BigDecimal applyCoupon(String couponCode, BigDecimal bookingAmount) {

		Coupon coupon = couponRepository.findByCouponCode(couponCode)
				.orElseThrow(() -> new RuntimeException("Invalid coupon code"));

		if (!coupon.getIsActive()) {
			throw new RuntimeException("Coupon is inactive");
		}

		if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Coupon has expired");
		}

		if (bookingAmount.compareTo(coupon.getMinimumBookingAmount()) < 0) {
			throw new RuntimeException("Minimum booking amount required: ₹" + coupon.getMinimumBookingAmount());
		}

		BigDecimal finalAmount = bookingAmount.subtract(coupon.getDiscountAmount());

		if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
			finalAmount = BigDecimal.ZERO;
		}

		return finalAmount;
	}
}