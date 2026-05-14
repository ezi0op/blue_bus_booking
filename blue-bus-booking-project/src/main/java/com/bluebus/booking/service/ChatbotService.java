package com.bluebus.booking.service;

import com.bluebus.booking.dto.ChatRequestDTO;
import com.bluebus.booking.dto.ChatResponseDTO;

public interface ChatbotService {

	ChatResponseDTO chat(ChatRequestDTO request);
}
