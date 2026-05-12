package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TripSearchRequest {

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;
    
    @NotNull(message = "Date is required")
    private LocalDate date;

    // 🔥 price filters
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // 🔥 use ENUM instead of String
    private String busType; 
    // (Better: create enum BusType if you want strict validation)

    // 🔥 use LocalTime instead of String
    private LocalTime departureAfter;
    private LocalTime departureBefore;
}