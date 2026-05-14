package com.bluebus.booking.dto;

import java.time.LocalTime;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StopDTO {

	private Long id;
	private String name;
	private Double latitude;
	private Double longitude;
	private Integer sequenceOrder;
	private Long routeId;
	private LocalTime arrivalTime;
	private LocalTime departureTime;
	private Boolean isActive;
}