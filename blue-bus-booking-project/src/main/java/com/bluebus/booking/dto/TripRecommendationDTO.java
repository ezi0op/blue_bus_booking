package com.bluebus.booking.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripRecommendationDTO {
    private Long tripId;
    private String source;
    private String destination;
    private String busName;
    private String busNumber;
    private String busType;
    private BigDecimal price;
    private String journeyDate;
    private String arrivalTime;
    private String departureTime;
    private String routeImage;
    private String busImage;
   
    private int availableSeats;
    private String recommendationReason;
    private double matchScore;
}
