package com.bluebus.booking.dto;

import java.math.BigDecimal;

import com.bluebus.booking.dto.enums.BusType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SmartSearchRequestDTO {

	private String query;

	private Long userId;

	private BusType preferredBusType;

	private BigDecimal minPrice;

	private BigDecimal maxPrice;

}