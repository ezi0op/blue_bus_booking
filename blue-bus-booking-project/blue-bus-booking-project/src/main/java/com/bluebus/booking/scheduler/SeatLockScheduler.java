package com.bluebus.booking.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.bluebus.booking.service.SeatAvailabilityService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SeatLockScheduler {

	@Autowired
	private SeatAvailabilityService seatAvailabilityService;

	// Runs every 1 minute
	@Scheduled(fixedRate = 60000)
	public void releaseExpiredLocks() {
		log.info("Running expired seat lock cleanup...");
		seatAvailabilityService.releaseExpiredLocks();
	}
}