package com.bluebus.booking.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.bluebus.booking.entity.Coupon;
import com.bluebus.booking.repository.CouponRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class CouponScheduler {

	@Autowired
	private CouponRepository couponRepository;

	/*
	 * Runs every day at midnight
	 */
	@Scheduled(cron = "0 0 0 * * ?")
	public void deactivateExpiredCoupons() {

		List<Coupon> expiredCoupons = couponRepository.findByExpiryDateBeforeAndIsActiveTrue(LocalDateTime.now());

		if (expiredCoupons.isEmpty()) {
			log.info("No expired coupons found");
			return;
		}

		for (Coupon coupon : expiredCoupons) {
			coupon.setIsActive(false);
		}

		couponRepository.saveAll(expiredCoupons);

		log.info("Deactivated {} expired coupons", expiredCoupons.size());
	}
}