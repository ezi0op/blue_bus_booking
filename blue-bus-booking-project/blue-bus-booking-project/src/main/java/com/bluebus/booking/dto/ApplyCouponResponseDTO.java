package com.bluebus.booking.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplyCouponResponseDTO {

	private BigDecimal originalAmount;

	private BigDecimal finalAmount;

	private BigDecimal discountApplied;

	private String message;
}