package com.bluebus.booking.dto;

import java.time.LocalDateTime;

import com.bluebus.booking.dto.enums.ChatIntent;

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
public class ChatResponseDTO {

	private String message;

	private String sessionId;

	private ChatIntent intent;
	// populated if intent matched real business action
	private Object data;

	private LocalDateTime timestamp;
}
