package com.bluebus.booking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateDTO {

	@Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
	private String name;

	@Email(message = "Invalid email format")
	private String email;

	@Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number format")
	private String phone;

	private String image;

	private Boolean isActive;
}
