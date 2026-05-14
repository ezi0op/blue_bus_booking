package com.bluebus.booking.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItemDTO {

	private Long id;

	private Long bookingId;

	private Long seatId;

	private String seatNumber;

	private String passengerName;

	private Integer passengerAge;

	private String passengerGender;

	private BigDecimal price;

}
