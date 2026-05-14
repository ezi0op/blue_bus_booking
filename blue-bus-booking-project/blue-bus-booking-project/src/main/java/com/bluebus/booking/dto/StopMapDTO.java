package com.bluebus.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StopMapDTO {

	private Long id;

	private String name;

	private Double latitude;

	private Double longitude;

	private Integer sequenceOrder;

	private String arrivalTime;

	private String departureTime;

	private Long routeId;
}