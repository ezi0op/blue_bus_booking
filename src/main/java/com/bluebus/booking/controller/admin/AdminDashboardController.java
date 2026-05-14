package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.AIAnalyticsDTO;
import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.DashboardSummaryDTO;
import com.bluebus.booking.service.AdminDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

	@Autowired
	private AdminDashboardService adminDashboardService;

	/*
	 * Core Metrics Summary
	 */
	@GetMapping("/summary")
	public ApiResponse<DashboardSummaryDTO> getDashboardSummary() {

		DashboardSummaryDTO response = adminDashboardService.getDashboardSummary();

		return new ApiResponse<>(true, "Dashboard summary fetched successfully", response);
	}

	/*
	 * AI Recommendation Analytics
	 */
	@GetMapping("/ai-analytics")
	public ApiResponse<AIAnalyticsDTO> getAIAnalytics() {

		AIAnalyticsDTO response = adminDashboardService.getAIAnalytics();

		return new ApiResponse<>(true, "AI analytics fetched successfully", response);
	}
}