package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.service.CancellationPolicyService;

@Service
public class CancellationPolicyServiceImpl implements CancellationPolicyService {

	@Autowired
	private BookingRepository bookingRepository;

	@Override
	public BigDecimal calculateRefundAmount(Long bookingId) {

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("Booking not found"));

		/*
		 * Calculate time difference between now and journey departure
		 */

		LocalDateTime now = LocalDateTime.now();

		LocalDateTime journeyDateTime = LocalDateTime.of(booking.getTrip().getJourneyDate(),
				booking.getTrip().getDepartureTime());

		long hoursBeforeJourney = Duration.between(now, journeyDateTime).toHours();

		BigDecimal finalAmount = booking.getFinalAmount();

		/*
		 * Cancellation Policy Rules
		 *
		 * >= 24 hrs → 100% refund 
		 * >= 12 hrs → 70% refund 
		 * >= 4 hrs  → 40% refund
		 * < 4 hrs   → No refund
		 */

		if (hoursBeforeJourney >= 24) {
			return finalAmount;
		}

		if (hoursBeforeJourney >= 12) {
			return finalAmount.multiply(BigDecimal.valueOf(0.70));
		}

		if (hoursBeforeJourney >= 4) {
			return finalAmount.multiply(BigDecimal.valueOf(0.40));
		}

		return BigDecimal.ZERO;

	}

}
