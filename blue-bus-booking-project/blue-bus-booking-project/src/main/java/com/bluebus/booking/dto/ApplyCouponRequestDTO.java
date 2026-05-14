package com.bluebus.booking.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ApplyCouponRequestDTO {

	private String couponCode;

	private BigDecimal bookingAmount;
}