package com.bluebus.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequestDTO {

	@NotNull(message = "Booking ID is required")
	private Long bookingId;

	private String couponCode;
}