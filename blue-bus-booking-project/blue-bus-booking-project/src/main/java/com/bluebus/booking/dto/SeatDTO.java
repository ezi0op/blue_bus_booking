package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.BusSeatType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDTO {

	private Long id;
	private String seatNumber;
	private BusSeatType seatType;
	private Integer rowNumber;
	private Integer columnNumber;
	private Boolean isWindow;
	private Boolean isAisle;
	private Boolean isActive;
	private Long busId;
}