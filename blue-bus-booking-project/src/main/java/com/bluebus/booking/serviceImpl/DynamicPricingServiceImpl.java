package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.service.DynamicPricingService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DynamicPricingServiceImpl implements DynamicPricingService {

	@Autowired
	private TripRepository tripRepository;

	@Override
	public BigDecimal calculateDynamicPrice(Trip trip) {
		BigDecimal basePrice = trip.getPrice();
		double multi = 1.0;

		// Rule 1 : occupany based pricing
		// More booked = higher price

		if (trip.getTotalSeats() > 0) {
			double occupancyRate = (double) (trip.getTotalSeats() - trip.getAvailableSeats()) / trip.getTotalSeats();

			if (occupancyRate >= 0.90) {
				multi += 0.30; // 30% surge
			} else if (occupancyRate >= 0.75) {
				multi += 0.20; // 20% surge
			} else if (occupancyRate >= 0.50) {
				multi += 0.10; // 10% surge
			} else if (occupancyRate < 0.20) {
				multi -= 0.10; // 10% discount
			}
		}

		// Rule 2 :Time to departure based pricing

		LocalDateTime departureDateTime = LocalDateTime.of(trip.getJourneyDate(), trip.getDepartureTime());

		long hoursUntilDeparture = ChronoUnit.HOURS.between(LocalDateTime.now(), departureDateTime);
		if (hoursUntilDeparture <= 2) {
			multi += 0.25; // Last 2 hours
		} else if (hoursUntilDeparture <= 6) {
			multi += 0.15; // Last 6 hours
		} else if (hoursUntilDeparture <= 24) {
			multi += 0.05; // Same day
		} else if (hoursUntilDeparture > 168) {
			multi -= 0.05; // 7+ days early booking
		}

		// RULE 3 - weekend pricing
		int dayOfWeek = trip.getJourneyDate().getDayOfWeek().getValue();

		if (dayOfWeek == 5 || dayOfWeek == 6 || dayOfWeek == 7) { // Saturday or Sunday
			multi += 0.10; // 10% surge on weekends
		}

		// Safety cap
		multi = Math.max(0.70, Math.min(2.00, multi));

		BigDecimal dynamicPrice = basePrice.multiply(BigDecimal.valueOf(multi)).setScale(2, RoundingMode.HALF_UP);

		log.debug("Trip {} → Base: {} | Multiplier: {} | Final: {}", trip.getId(), basePrice, multi, dynamicPrice);

		return dynamicPrice;
	}

	@Override
	@Transactional
	public void applyDynamicPricingToAllActiveTrips() {

		List<Trip> activeTrips = tripRepository.findByStatusAndDepartureTimeAfter(TripStatus.SCHEDULED,
				LocalTime.now());

		for (Trip trip : activeTrips) {
			BigDecimal newPrice = calculateDynamicPrice(trip);

			trip.setPrice(newPrice);
			tripRepository.save(trip);
		}

		log.info("Dynamic pricing applied to {} trips", activeTrips.size());
	}

}
