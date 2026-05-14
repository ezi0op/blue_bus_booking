package com.bluebus.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminTripCancellationRequestDTO {

	@NotBlank(message = "Cancellation reason is required")
	private String reason;

}