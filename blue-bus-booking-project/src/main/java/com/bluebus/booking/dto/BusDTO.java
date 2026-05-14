package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.BusType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusDTO {

	private Long id;
	private String busNumber;
	private BusType busType;
	private Integer totalSeats;
	private Long operatorId;
	private String operatorName;
	private String image;
	private Boolean isActive;
}