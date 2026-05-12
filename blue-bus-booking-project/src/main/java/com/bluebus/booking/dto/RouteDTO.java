package com.bluebus.booking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteDTO {

	private Long id;
	private String source;
	private String destination;
	private Double distance;
	private String image;
	private Integer duration;

	private Boolean isActive;
}