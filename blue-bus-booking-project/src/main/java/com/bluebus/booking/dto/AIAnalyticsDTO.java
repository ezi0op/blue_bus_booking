package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.SeatType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIAnalyticsDTO {

	private String mostSearchedRoute;

	private String topRecommendedRoute;

	private SeatType mostPreferredSeatType;

	private Long chatbotUsageCount;

}