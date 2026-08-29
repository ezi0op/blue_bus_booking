package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Coupon;
import com.bluebus.booking.repository.CouponRepository;
import com.bluebus.booking.service.CouponService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CouponServiceImpl implements CouponService {

	@Autowired
	private CouponRepository couponRepository;

	@Override
	public Coupon createCoupon(Coupon coupon) {
		log.info("createCoupon called with coupon: {}", coupon);
		try {
			if (couponRepository.existsByCouponCode(coupon.getCouponCode())) {
				throw new RuntimeException("Coupon code already exists");
			}
			return couponRepository.save(coupon);
		} catch (Exception e) {
			log.error("Error in createCoupon with coupon: {}", coupon, e);
			throw e;
		}
	}

	@Override
	public Coupon updateCoupon(Long couponId, Coupon coupon) {
		log.info("updateCoupon called with couponId: {}, coupon: {}", couponId, coupon);
		try {
			Coupon existingCoupon = couponRepository.findById(couponId)
					.orElseThrow(() -> new RuntimeException("Coupon not found"));

			existingCoupon.setCouponCode(coupon.getCouponCode());
			existingCoupon.setDescription(coupon.getDescription());
			existingCoupon.setDiscountAmount(coupon.getDiscountAmount());
			existingCoupon.setMinimumBookingAmount(coupon.getMinimumBookingAmount());
			existingCoupon.setExpiryDate(coupon.getExpiryDate());
			existingCoupon.setIsActive(coupon.getIsActive());

			return couponRepository.save(existingCoupon);
		} catch (Exception e) {
			log.error("Error in updateCoupon with couponId: {}, coupon: {}", couponId, coupon, e);
			throw e;
		}
	}

	@Override
	public void deleteCoupon(Long couponId) {
		log.info("deleteCoupon called with couponId: {}", couponId);
		try {
			Coupon coupon = couponRepository.findById(couponId).orElseThrow(() -> new RuntimeException("Coupon not found"));

			couponRepository.delete(coupon);
		} catch (Exception e) {
			log.error("Error in deleteCoupon with couponId: {}", couponId, e);
			throw e;
		}
	}

	@Override
	public List<Coupon> getAllCoupons() {
		log.info("getAllCoupons called");
		try {
			return couponRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllCoupons", e);
			throw e;
		}
	}

	@Override
	public BigDecimal applyCoupon(String couponCode, BigDecimal bookingAmount) {
		log.info("applyCoupon called with couponCode: {}, bookingAmount: {}", couponCode, bookingAmount);
		try {
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
		} catch (Exception e) {
			log.error("Error in applyCoupon with couponCode: {}, bookingAmount: {}", couponCode, bookingAmount, e);
			throw e;
		}
	}
}