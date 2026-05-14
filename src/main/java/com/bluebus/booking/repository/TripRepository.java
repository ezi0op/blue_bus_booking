package com.bluebus.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {

	List<Trip> findByRouteIdAndStatus(Long routeId, TripStatus scheduled);

	List<Trip> findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateAndStatus(String source,
			String destination, LocalDate date, TripStatus status);

	List<Trip> findByStatusAndJourneyDateGreaterThanEqual(TripStatus scheduled, LocalDate now);

	List<Trip> findByStatusAndDepartureTimeAfter(TripStatus scheduled, LocalTime now);

	List<Trip> findByRouteSourceAndRouteDestinationAndDepartureTimeBetweenAndStatus(String source, String destination,
			LocalDateTime startOfDay, LocalDateTime endOfDay, TripStatus scheduled);

	List<Trip> findByJourneyDateAndStatus(LocalDate date, TripStatus status);

	List<Trip> findByRoute_SourceIgnoreCaseAndJourneyDateAndStatus(String source, LocalDate date, TripStatus status);

	List<Trip> findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(String source, String destination, LocalDate date, TripStatus status);

	List<Trip> findByRoute_SourceIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(String source, LocalDate date, TripStatus status);

	List<Trip> findByRoute_DestinationIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(String destination, LocalDate date, TripStatus status);

	List<Trip> findByRoute_DestinationIgnoreCaseAndJourneyDateAndStatus(String destination, LocalDate journeyDate,
			TripStatus scheduled);

	@org.springframework.data.jpa.repository.Query("SELECT MIN(t.journeyDate) FROM Trip t WHERE t.route.id = :routeId AND t.journeyDate >= :today AND t.status = com.bluebus.booking.dto.enums.TripStatus.SCHEDULED")
	LocalDate findNextTripDate(@org.springframework.data.repository.query.Param("routeId") Long routeId, @org.springframework.data.repository.query.Param("today") LocalDate today);

}
