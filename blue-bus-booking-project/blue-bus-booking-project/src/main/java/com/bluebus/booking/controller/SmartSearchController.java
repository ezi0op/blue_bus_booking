package com.bluebus.booking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.SmartSearchRequestDTO;
import com.bluebus.booking.dto.TripRecommendationDTO;
import com.bluebus.booking.service.SmartSearchService;

@RestController
@RequestMapping("/api/smart-search")
public class SmartSearchController {

	@Autowired
	private SmartSearchService smartSearchService;

	@PostMapping("/search")
	public ApiResponse<List<TripRecommendationDTO>> smartSearch(@RequestBody SmartSearchRequestDTO request) {

		List<TripRecommendationDTO> results = smartSearchService.search(request.getQuery(), request.getUserId());

		return new ApiResponse<>(true, "Smart search completed successfully", results);
	}
}