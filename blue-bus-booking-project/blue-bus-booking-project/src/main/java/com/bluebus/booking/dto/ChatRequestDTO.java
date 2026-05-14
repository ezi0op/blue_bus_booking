package com.bluebus.booking.dto;

import jakarta.validation.constraints.NotBlank;
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
public class ChatRequestDTO {

	@NotBlank(message = "Message is required")
	private String message;

	@NotBlank(message = "Session ID is required")
	private String sessionId;

	private Long userId;

}
