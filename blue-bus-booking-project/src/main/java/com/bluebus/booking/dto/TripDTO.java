package com.bluebus.booking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bluebus.booking.dto.enums.BusType;

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

	private String source;
	private String destination;
	private String routeImage;
	private String busName;
	private String busImage;
	private BusType busType;

	private LocalDate journeyDate;

	private LocalTime departureTime;
	private LocalTime arrivalTime;

	private java.math.BigDecimal price;

	private Integer totalSeats;
	private Integer availableSeats;
	private Integer bookedSeats;

	private com.bluebus.booking.dto.enums.TripStatus status;

	private java.math.BigDecimal rating;

	private LocalDateTime cancelledAt;

	private BusOperatorDTO operator;
}