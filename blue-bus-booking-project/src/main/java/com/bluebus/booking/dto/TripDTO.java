package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bluebus.booking.dto.enums.TripStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDTO {

	private Long id;

	private Long routeId;
	private Long busId;

	private LocalDate journeyDate;

	private LocalTime departureTime;
	private LocalDateTime arrivalTime;

	private BigDecimal price;

	private Integer totalSeats;
	private Integer availableSeats;
	private Integer bookedSeats;

	private TripStatus status;

	private BigDecimal rating;

	private LocalDateTime cancelledAt;

	private BusOperatorDTO operator;
}