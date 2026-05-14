package com.bluebus.booking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassengerDTO {

	private Long seatId;

	private String name;
	private Integer age;
	private String gender;
}