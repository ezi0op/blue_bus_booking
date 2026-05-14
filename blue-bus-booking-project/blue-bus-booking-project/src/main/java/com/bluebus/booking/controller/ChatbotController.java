package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.ChatRequestDTO;
import com.bluebus.booking.dto.ChatResponseDTO;
import com.bluebus.booking.service.ChatbotService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/ai/chat")
@Slf4j
public class ChatbotController {

	@Autowired
	private ChatbotService chatbotService;

	@PostMapping("/message")
	public ApiResponse<ChatResponseDTO> chat(@Valid @RequestBody ChatRequestDTO request) {
		try {
			log.info("Received chat request - sessionId: {}, userId: {}", request.getSessionId(), request.getUserId());

			ChatResponseDTO response = chatbotService.chat(request);

			log.info("Chat response generated successfully - intent: {}", response.getIntent());

			return new ApiResponse<>(true, "Chat response generated successfully", response);

		} catch (Exception e) {
			log.error("Error processing chat request", e);
			return new ApiResponse<>(false, "Error processing chat: " + e.getMessage(), null);
		}
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ApiResponse<String> handleIllegalArgument(IllegalArgumentException e) {
		log.error("Invalid argument", e);
		return new ApiResponse<>(false, "Invalid request: " + e.getMessage(), null);
	}

	@ExceptionHandler(RuntimeException.class)
	public ApiResponse<String> handleRuntime(RuntimeException e) {
		log.error("Runtime error", e);
		return new ApiResponse<>(false, "Server error: " + e.getMessage(), null);
	}
}