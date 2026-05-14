package com.bluebus.booking.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

	private Long userId;
	private Long tripId;

	private String contactEmail;
	private String contactPhone;
	private String couponCode;
	private java.math.BigDecimal discountAmount;
	private List<PassengerDTO> passengers;
}