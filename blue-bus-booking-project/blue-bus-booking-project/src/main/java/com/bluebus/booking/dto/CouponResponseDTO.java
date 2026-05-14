package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CouponResponseDTO {

	private Long id;

	private String couponCode;

	private String description;

	private BigDecimal discountAmount;

	private BigDecimal minimumBookingAmount;

	private Boolean isActive;

	private LocalDateTime expiryDate;

	private String message;
}