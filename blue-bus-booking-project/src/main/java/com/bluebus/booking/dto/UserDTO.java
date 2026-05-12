package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

	private Long id;
	private String name;
	private String email;
	private String phone;
	private String image;
	private Boolean isActive;
	private Role role;
	
	
}