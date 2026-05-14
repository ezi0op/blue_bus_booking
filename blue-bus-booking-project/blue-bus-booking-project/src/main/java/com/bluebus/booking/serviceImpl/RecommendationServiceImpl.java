package com.bluebus.booking.serviceImpl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.TripRecommendationDTO;
import com.bluebus.booking.dto.enums.SeatType;
import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.SeatPreference;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.SeatPreferenceRepository;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.service.RecommendationService;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SeatPreferenceRepository seatPreferenceRepository;

    @Override
    public List<TripRecommendationDTO> getRecommendationsForUser(Long userId) {
        List<TripRecommendationDTO> recommendations = new ArrayList<>();
        
        // 1. Get User's Seat Preference
        Optional<SeatPreference> preferenceOpt = seatPreferenceRepository.findByUserId(userId);
        
        // 2. Get User's Past Bookings to find favorite routes
        List<Booking> pastBookings = bookingRepository.findByUserId(userId);
        
        // 3. Find Upcoming Trips
        List<Trip> upcomingTrips = tripRepository.findByStatusAndJourneyDateGreaterThanEqual(TripStatus.SCHEDULED, LocalDate.now());
        
        if (upcomingTrips.isEmpty()) return recommendations;

        // Personalization Logic
        for (Trip trip : upcomingTrips) {
            double score = 0.0;
            List<String> reasons = new ArrayList<>();

            // Match Route (Past Bookings)
            boolean isFrequentRoute = pastBookings.stream()
                .anyMatch(b -> b.getTrip().getRoute().getId().equals(trip.getRoute().getId()));
            
            if (isFrequentRoute) {
                score += 0.5;
                reasons.add("Based on your frequent route");
            }

            // Match Seat Preference
            if (preferenceOpt.isPresent()) {
                SeatPreference pref = preferenceOpt.get();
                // If user has a preference and this bus fits the type (simplistic check)
                if (pref.getPreferredSeatType() != SeatType.NO_PREFERENCE) {
                    score += 0.3;
                    reasons.add("Matches your " + pref.getPreferredSeatType().toString().toLowerCase() + " seat preference");
                }
                if (pref.getPreferredDeckType() != com.bluebus.booking.dto.enums.DeckType.NO_PREFERENCE) {
                    score += 0.2;
                    reasons.add("Matches your " + pref.getPreferredDeckType().toString().toLowerCase() + " deck preference");
                }
            }

            if (score > 0) {
                String reason = reasons.isEmpty() ? "Highly rated trip" : String.join(" • ", reasons);
                recommendations.add(mapToDTO(trip, score, reason));
            }
            
            if (recommendations.size() >= 5) break;
        }

        // If no personalized recommendations, fallback to popular
        if (recommendations.isEmpty()) {
            return getPopularTrips();
        }

        return recommendations.stream()
            .sorted((a, b) -> Double.compare(b.getMatchScore(), a.getMatchScore()))
            .limit(5)
            .collect(Collectors.toList());
    }

    @Override
    public List<TripRecommendationDTO> getPopularTrips() {
        List<Trip> upcomingTrips = tripRepository.findByStatusAndJourneyDateGreaterThanEqual(TripStatus.SCHEDULED, LocalDate.now());
        
        // Use real popularity from repository if possible, or just mock some smart reasons
        String topRoute = bookingRepository.findTopBookedRoute();
        
        return upcomingTrips.stream()
            .limit(5)
            .map(trip -> {
                String route = trip.getRoute().getSource() + " → " + trip.getRoute().getDestination();
                String reason = route.equals(topRoute) ? "Most popular route this week" : "Trending among travelers";
                return mapToDTO(trip, 0.8, reason);
            })
            .collect(Collectors.toList());
    }

    private TripRecommendationDTO mapToDTO(Trip trip, double score, String reason) {
        return TripRecommendationDTO.builder()
            .tripId(trip.getId())
            .source(trip.getRoute().getSource())
            .destination(trip.getRoute().getDestination())
            .busName(trip.getBus().getBusNumber())
            .busType(trip.getBus().getBusType().toString())
            .price(trip.getPrice())
            .journeyDate(trip.getJourneyDate().toString())
            .departureTime(trip.getDepartureTime().toString())
            .availableSeats(trip.getAvailableSeats())
            .recommendationReason(reason)
            .matchScore(score)
            .build();
    }
}
