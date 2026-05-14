package com.bluebus.booking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.TripRecommendationDTO;
import com.bluebus.booking.service.RecommendationService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

	@Autowired
	private RecommendationService recommendationService;

	// Get personalized recommendations for specific user
	@GetMapping("/user/{userId}")
	public ApiResponse<List<TripRecommendationDTO>> getRecommendationsForUser(@PathVariable Long userId) {

		List<TripRecommendationDTO> recommendations = recommendationService.getRecommendationsForUser(userId);

		return new ApiResponse<>(true, "User recommendations fetched successfully", recommendations);
	}

	// Get popular trips (fallback / general recommendations)
	@GetMapping("/popular")
	public ApiResponse<List<TripRecommendationDTO>> getPopularTrips() {

		List<TripRecommendationDTO> popularTrips = recommendationService.getPopularTrips();

		return new ApiResponse<>(true, "Popular trips fetched successfully", popularTrips);
	}
}