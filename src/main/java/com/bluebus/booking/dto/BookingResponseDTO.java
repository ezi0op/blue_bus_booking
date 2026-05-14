package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bluebus.booking.dto.enums.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

	private Long id;
	private Long userId;
	private Long tripId;

	private String bookingReference;

	private BigDecimal totalAmount;
	private BigDecimal finalAmount;

	private LocalDateTime bookingTime;

	private BookingStatus status;

	private String contactEmail;
	private String contactPhone;

	private List<PassengerResponseDTO> passengers; // ✅ ADD THIS
}