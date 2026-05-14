package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.DeckType;
import com.bluebus.booking.dto.enums.SeatType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatPreferenceDTO {

	// Preferred seat type → WINDOW / AISLE / NO_PREFERENCE
	private SeatType preferredSeatType;

	// Preferred deck → LOWER / UPPER / NO_PREFERENCE
	private DeckType preferredDeckType;

	private Integer windowCount;
	private Integer aisleCount;
	private Integer lowerBerthCount;
	private Integer upperBerthCount;
	private Integer totalBookingsAnalysed;
}
