package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.TripRecommendationDTO;
import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.service.DynamicPricingService;
import com.bluebus.booking.service.SmartSearchService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SmartSearchServiceImpl implements SmartSearchService {

	@Autowired
	private ChatClient chatClient;

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private DynamicPricingService dynamicPricingService;
	
	@Autowired
	private ObjectMapper objectMapper;

	private static final String PARSE_PROMPT = """
			Extract travel details from the user's query.

			IMPORTANT:
			- Return ONLY valid JSON
			- Do NOT ask questions
			- Do NOT explain anything
			- Do NOT return text
			- Do NOT return placeholders like YYYY-MM-DD
			- Always return actual values
			- If a date is not mentioned, MUST return null for date

			Format:
			{
			  "source": "CITY",
			  "destination": "CITY",
			  "date": "YYYY-MM-DD",
			  "minPrice": null,
			  "maxPrice": null,
			  "busType": null
			}

			Rules:
			- City names must be UPPERCASE
			- AUTO-CORRECT any spelling mistakes in city names (e.g., 'hyderbad' -> 'HYDERABAD', 'mumbay' -> 'MUMBAI')
			- today means %s
			- tomorrow means %s
			- busType can be:
			  AC, NON_AC, SLEEPER, SEMI_SLEEPER, VOLVO
			- If value not found, use null only

			User Query: "%s"
			""";

	@Override
	public List<TripRecommendationDTO> search(String naturalLanguageQuery, Long userId) {
		log.info("search called with naturalLanguageQuery: '{}', userId: {}", naturalLanguageQuery, userId);
		try {
			// Step 1: Ask AI to parse natural language
			String today = LocalDate.now().toString();
			String tomorrow = LocalDate.now().plusDays(1).toString();
			String prompt = String.format(PARSE_PROMPT, today, tomorrow, naturalLanguageQuery);

			String jsonResponse = chatClient.prompt().user(prompt).call().content();
			log.info("Raw AI Response: {}", jsonResponse);

			if (jsonResponse == null || jsonResponse.isBlank()) {
				throw new RuntimeException("AI search service returned an empty response. Please try again.");
			}

			// Robust JSON extraction: Find the first '{' and last '}'
			int firstBrace = jsonResponse.indexOf('{');
			int lastBrace = jsonResponse.lastIndexOf('}');
			
			if (firstBrace >= 0 && lastBrace > firstBrace) {
				jsonResponse = jsonResponse.substring(firstBrace, lastBrace + 1);
			} else {
				log.error("No JSON object found in AI response: {}", jsonResponse);
				throw new RuntimeException("AI search failed to parse travel details. Please try a simpler query.");
			}

			log.info("Extracted JSON: {}", jsonResponse);

			// Step 2: Use ObjectMapper for robust parsing
			JsonNode root = objectMapper.readTree(jsonResponse);
			
			String source = root.has("source") && !root.get("source").isNull() ? root.get("source").asText() : null;
			String destination = root.has("destination") && !root.get("destination").isNull() ? root.get("destination").asText() : null;
			String dateStr = root.has("date") && !root.get("date").isNull() ? root.get("date").asText() : null;
			String minPriceStr = root.has("minPrice") && !root.get("minPrice").isNull() ? root.get("minPrice").asText() : null;
			String maxPriceStr = root.has("maxPrice") && !root.get("maxPrice").isNull() ? root.get("maxPrice").asText() : null;
			String busTypeStr = root.has("busType") && !root.get("busType").isNull() ? root.get("busType").asText() : null;

			boolean exactDate = true;
			if (dateStr == null || dateStr.equals("null") || dateStr.isBlank()) {
				log.warn("Mandatory field 'date' missing in AI response. Searching upcoming trips.");
				dateStr = LocalDate.now().toString();
				exactDate = false;
			}

			// Convert prices
			final BigDecimal minPrice = (minPriceStr != null && !minPriceStr.equals("null")) ? new BigDecimal(minPriceStr) : null;
			final BigDecimal maxPrice = (maxPriceStr != null && !maxPriceStr.equals("null")) ? new BigDecimal(maxPriceStr) : null;

			// Step 3: Parse date
			LocalDate journeyDate = LocalDate.parse(dateStr);

			// Step 4: Search trips
			List<Trip> trips;
			if (exactDate) {
				if (source != null && destination != null) {
					trips = tripRepository.findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateAndStatus(
							source, destination, journeyDate, TripStatus.SCHEDULED);
				} else if (source != null) {
					trips = tripRepository.findByRoute_SourceIgnoreCaseAndJourneyDateAndStatus(source, journeyDate, TripStatus.SCHEDULED);
				} else if (destination != null) {
					trips = tripRepository.findByRoute_DestinationIgnoreCaseAndJourneyDateAndStatus(destination, journeyDate, TripStatus.SCHEDULED);
				} else {
					trips = tripRepository.findByJourneyDateAndStatus(journeyDate, TripStatus.SCHEDULED);
				}
			} else {
				if (source != null && destination != null) {
					trips = tripRepository.findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(
							source, destination, journeyDate, TripStatus.SCHEDULED);
				} else if (source != null) {
					trips = tripRepository.findByRoute_SourceIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(source, journeyDate, TripStatus.SCHEDULED);
				} else if (destination != null) {
					trips = tripRepository.findByRoute_DestinationIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(destination, journeyDate, TripStatus.SCHEDULED);
				} else {
					trips = tripRepository.findByStatusAndJourneyDateGreaterThanEqual(TripStatus.SCHEDULED, journeyDate);
				}
			}

			log.info("Found {} base trips for date {}", trips.size(), journeyDate);

			// Filter by bus type if provided
			if (busTypeStr != null && !busTypeStr.equals("null")) {
				trips = trips.stream()
						.filter(t -> t.getBus().getBusType().name().equalsIgnoreCase(busTypeStr))
						.collect(Collectors.toList());
			}

			// Apply min/max pricing and build recommendations
			return trips.stream()
					.filter(trip -> {
						BigDecimal dynamicPrice = dynamicPricingService.calculateDynamicPrice(trip);
						boolean matchesMin = minPrice == null || dynamicPrice.compareTo(minPrice) >= 0;
						boolean matchesMax = maxPrice == null || dynamicPrice.compareTo(maxPrice) <= 0;
						return matchesMin && matchesMax;
					})
					.map(trip -> {
						BigDecimal finalPrice = dynamicPricingService.calculateDynamicPrice(trip);
						String reason = "Perfect match for your search";
						if (maxPrice != null && finalPrice.compareTo(maxPrice) <= 0) {
							reason = "Fits your budget of ₹" + maxPrice;
						} else if (busTypeStr != null) {
							reason = "Matches your preferred " + busTypeStr + " comfort";
						} else if (source == null) {
							reason = "Trending trip on " + trip.getRoute().getSource() + " route";
						}

						return TripRecommendationDTO.builder()
								.tripId(trip.getId())
								.source(trip.getRoute().getSource())
								.destination(trip.getRoute().getDestination())
								.journeyDate(trip.getJourneyDate().toString())
								.departureTime(trip.getDepartureTime().toString())
								.arrivalTime(trip.getArrivalTime() != null ? trip.getArrivalTime().toString() : null)
								.busName(trip.getBus().getBusNumber())
								.busType(trip.getBus().getBusType().toString())
								.price(finalPrice)
								.availableSeats(trip.getAvailableSeats())
								.routeId(trip.getRoute().getId())
								.busId(trip.getBus().getId())
								.routeImage(trip.getRoute().getImage())
								.busImage(trip.getBus().getImage())
								.recommendationReason(reason)
								.matchScore(source != null ? 1.0 : 0.85)
								.build();
					})
					.limit(10)
					.collect(Collectors.toList());

		} catch (Exception e) {
			log.error("Critical error in smart search for query: '{}'", naturalLanguageQuery, e);
			
			// Check if it's an AI connectivity/auth issue
			String errorMsg = e.getMessage();
			if (errorMsg != null && (errorMsg.contains("401") || errorMsg.contains("API key") || errorMsg.contains("Unauthorized"))) {
				throw new RuntimeException("AI Search service configuration error. Please check the API keys.");
			}
			
			if (errorMsg != null && (errorMsg.contains("429") || errorMsg.contains("quota"))) {
				throw new RuntimeException("AI Search limit reached for today. Please try again later.");
			}

			throw new RuntimeException("Smart search encountered an issue: " + (errorMsg != null ? errorMsg : "Unknown error"));
		}
	}
}
