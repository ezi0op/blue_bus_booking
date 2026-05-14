package com.bluebus.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutDTO {
	private Long id;
	private Long seatId;
	private String seatNumber;
	private Boolean isBooked;
	private String seatType;
	private Integer rowNumber;
	private Integer columnNumber;
	private com.bluebus.booking.dto.enums.DeckType deckType;
}
