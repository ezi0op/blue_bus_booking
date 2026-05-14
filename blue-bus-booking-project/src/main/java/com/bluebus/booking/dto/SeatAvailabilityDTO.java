package com.bluebus.booking.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailabilityDTO {

	private Long id;
	private Long tripId;
	private Long seatId;
	private Long bookingId;
	private Boolean isBooked;
	private Boolean isLocked;
	private LocalDateTime lockExpiryTime;
}