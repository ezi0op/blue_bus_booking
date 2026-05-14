package com.bluebus.booking.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

	private Long totalUsers;

	private Long totalBookings;

	private BigDecimal totalRevenue;

	private Long totalTrips;

	private Long totalBuses;
	
	private Long totalBusOperators;

	private Long cancelledBookings;

	private Long successfulPayments;

	private Long pendingPayments;

	private Long totalRefunds;

	private String mostUsedCoupon;

	private BigDecimal totalDiscountGiven;
}