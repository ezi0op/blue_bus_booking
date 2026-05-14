package com.bluebus.booking.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.bluebus.booking.service.DynamicPricingService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class DynamicPricingScheduler {

	@Autowired
	private DynamicPricingService dynamicPricingService;

	/*
	 * Runs every 30 minutes
	 *
	 * 1800000 ms = 30 min
	 */

	@Scheduled(fixedRate = 1800000)
	public void runDynamicPricing() {

		log.info("Running scheduled dynamic pricing update...");

		dynamicPricingService.applyDynamicPricingToAllActiveTrips();
	}

}
