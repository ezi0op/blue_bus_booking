package com.bluebus.booking.service;

import java.math.BigDecimal;

import com.bluebus.booking.entity.Trip;

public interface DynamicPricingService {

	BigDecimal calculateDynamicPrice(Trip trip);

	void applyDynamicPricingToAllActiveTrips();
}
