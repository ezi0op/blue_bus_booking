package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.dto.TripRecommendationDTO;

public interface SmartSearchService {

	// Natural language search like:
	// "Need AC bus from Pune to Mumbai tomorrow under 800"

	List<TripRecommendationDTO> search(String naturalLanguageQuery, Long userId);

}