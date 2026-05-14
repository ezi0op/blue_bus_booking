package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);

	List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

	List<ChatMessage> findBySessionIdAndUserIdOrderByCreatedAtAsc(String sessionId, Long userId);

}
