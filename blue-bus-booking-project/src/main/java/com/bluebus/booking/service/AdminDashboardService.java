package com.bluebus.booking.service;

import com.bluebus.booking.dto.AIAnalyticsDTO;
import com.bluebus.booking.dto.DashboardSummaryDTO;

public interface AdminDashboardService {

	DashboardSummaryDTO getDashboardSummary();

	AIAnalyticsDTO getAIAnalytics();
}