package com.bluebus.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PassengerResponseDTO {

	private Long seatId;
	private String seatNumber;

	private String name;
	private Integer age;
	private String gender;
}
