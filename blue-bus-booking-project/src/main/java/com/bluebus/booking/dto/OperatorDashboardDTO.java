package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperatorDashboardDTO {

	private Long operatorId;
	private String operatorName;

	// Stats
	private BigDecimal totalEarnings;
	private long totalBuses;
	private long activeTripsCount;
	private long totalSeatsSold;
	private double averageOccupancyRate; // e.g., 85.5%

	// Recent Activity
	private List<BookingItemDTO> recentBookings;
	private List<TripDTO> upcomingTrips;

}
