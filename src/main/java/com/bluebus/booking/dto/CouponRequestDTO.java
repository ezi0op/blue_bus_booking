package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CouponRequestDTO {

	private String couponCode;

	private String description;

	private BigDecimal discountAmount;

	private BigDecimal minimumBookingAmount;

	private Boolean isActive;

	private LocalDate expiryDate;
}