package com.bluebus.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusOperatorDTO {

	private Long id;
	private String name;
	private String contactEmail;
	private String contactPhone;
	private String licenseNumber;
	private Double rating;
	private Boolean isActive;

	private String image;



}
