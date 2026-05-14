package com.bluebus.booking.service;

import java.util.List;
import com.bluebus.booking.dto.TripRecommendationDTO;

public interface RecommendationService {
    List<TripRecommendationDTO> getRecommendationsForUser(Long userId);
    List<TripRecommendationDTO> getPopularTrips();
}
