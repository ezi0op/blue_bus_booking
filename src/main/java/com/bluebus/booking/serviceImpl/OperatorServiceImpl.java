package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.BookingItemDTO;
import com.bluebus.booking.dto.BusDTO;
import com.bluebus.booking.dto.OperatorDashboardDTO;
import com.bluebus.booking.dto.TripDTO;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.BusOperatorRepository;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.repository.RouteRepository;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.service.OperatorService;

/**
 * Implementation of OperatorService for Bus Operator Portal functionality.
 * Handles statistics, fleet management, and passenger manifests.
 */
@Service
public class OperatorServiceImpl implements OperatorService {

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private BusRepository busRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private BusOperatorRepository busOperatorRepository;

	@Override
	public OperatorDashboardDTO getDashboardStats(Long operatorId) {
		// 1. Fetch data filtered by operator
		List<Bus> myBuses = busRepository.findByOperatorId(operatorId);
		List<Trip> myTrips = tripRepository.findByBusOperatorId(operatorId);

		// 2. Calculate Smart Stats
		BigDecimal totalEarnings = myTrips.stream()
				.flatMap(t -> t.getBookings().stream())
				.map(Booking::getTotalAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		long seatsSold = myTrips.stream()
				.mapToLong(Trip::getBookedSeats)
				.sum();

		// 3. Build the Dashboard DTO
		return OperatorDashboardDTO.builder()
				.operatorId(operatorId)
				.totalEarnings(totalEarnings)
				.totalBuses(myBuses.size())
				.activeTripsCount(myTrips.size())
				.totalSeatsSold(seatsSold)
				.averageOccupancyRate(calculateOccupancy(myTrips))
				.build();
	}

	@Override
	public List<BusDTO> getMyBuses(Long operatorId) {
		return busRepository.findByOperatorId(operatorId).stream()
				.map(this::mapBusToDTO)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public BusDTO addBus(Long operatorId, BusDTO busDTO) {
		com.bluebus.booking.entity.BusOperator operator = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new RuntimeException("Operator not found"));

		Bus bus = Bus.builder()
				.busNumber(busDTO.getBusNumber())
				.busType(busDTO.getBusType())
				.totalSeats(busDTO.getTotalSeats())
				.operator(operator)
				.isActive(true)
				.image(busDTO.getImage())
				.build();

		Bus savedBus = busRepository.save(bus);
		return mapBusToDTO(savedBus);
	}

	@Override
	public List<TripDTO> getMyTrips(Long operatorId) {
		return tripRepository.findByBusOperatorId(operatorId).stream()
				.map(this::mapTripToDTO)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public TripDTO scheduleTrip(Long operatorId, TripDTO tripDTO) {
		// 1. Fetch Bus and verify ownership
		Bus bus = busRepository.findById(tripDTO.getBusId())
				.filter(b -> b.getOperator().getId().equals(operatorId))
				.orElseThrow(() -> new RuntimeException("Bus not found or access denied"));

		// 2. Fetch Route
		com.bluebus.booking.entity.Route route = routeRepository.findById(tripDTO.getRouteId())
				.orElseThrow(() -> new RuntimeException("Route not found"));

		// 3. Create Trip Entity
		LocalDateTime arrivalDateTime = LocalDateTime.of(tripDTO.getJourneyDate(), tripDTO.getArrivalTime());
		// If arrival time is before departure time, it's the next day
		if (tripDTO.getArrivalTime().isBefore(tripDTO.getDepartureTime())) {
			arrivalDateTime = arrivalDateTime.plusDays(1);
		}

		Trip trip = Trip.builder()
				.route(route)
				.bus(bus)
				.journeyDate(tripDTO.getJourneyDate())
				.departureTime(tripDTO.getDepartureTime())
				.arrivalTime(arrivalDateTime)
				.price(tripDTO.getPrice())
				.status(com.bluebus.booking.dto.enums.TripStatus.SCHEDULED)
				.totalSeats(bus.getTotalSeats())
				.availableSeats(bus.getTotalSeats())
				.bookedSeats(0)
				.build();

		Trip savedTrip = tripRepository.save(trip);
		return mapTripToDTO(savedTrip);
	}

	@Override
	@Transactional
	public TripDTO updateTripStatus(Long tripId, Long operatorId, String status) {
		Trip trip = tripRepository.findById(tripId)
				.filter(t -> t.getBus().getOperator().getId().equals(operatorId))
				.orElseThrow(() -> new RuntimeException("Trip not found or access denied"));

		try {
			trip.setStatus(com.bluebus.booking.dto.enums.TripStatus.valueOf(status.toUpperCase()));
		} catch (IllegalArgumentException e) {
			throw new RuntimeException("Invalid status: " + status);
		}
		
		Trip updatedTrip = tripRepository.save(trip);
		return mapTripToDTO(updatedTrip);
	}

	@Override
	public List<BookingItemDTO> getBookingsForOperator(Long operatorId) {
		List<Trip> myTrips = tripRepository.findByBusOperatorId(operatorId);
		return myTrips.stream()
				.flatMap(t -> t.getBookings().stream())
				.flatMap(b -> b.getBookingItems().stream())
				.map(this::mapBookingItemToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public List<BookingItemDTO> getPassengerManifest(Long tripId, Long operatorId) {
		// Security check: Ensure the trip belongs to this operator
		Trip trip = tripRepository.findById(tripId)
				.filter(t -> t.getBus().getOperator().getId().equals(operatorId))
				.orElseThrow(() -> new RuntimeException("Trip not found or access denied"));

		return trip.getBookings().stream()
				.flatMap(b -> b.getBookingItems().stream())
				.map(this::mapBookingItemToDTO)
				.collect(Collectors.toList());
	}

	@Override
	public BigDecimal getEarningsByPeriod(Long operatorId, String period) {
		List<Trip> myTrips = tripRepository.findByBusOperatorId(operatorId);
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime start;

		switch (period.toUpperCase()) {
			case "DAILY": start = now.withHour(0).withMinute(0); break;
			case "WEEKLY": start = now.minusDays(7); break;
			case "MONTHLY": start = now.minusMonths(1); break;
			default: start = now.minusYears(1);
		}

		return myTrips.stream()
				.flatMap(t -> t.getBookings().stream())
				.filter(b -> b.getBookingTime().isAfter(start))
				.map(Booking::getTotalAmount)
				.reduce(BigDecimal.ZERO, BigDecimal::add);
	}

	// --- Helper Methods ---

	private double calculateOccupancy(List<Trip> trips) {
		if (trips.isEmpty()) return 0.0;
		double totalCapacity = trips.stream().mapToDouble(t -> t.getTotalSeats()).sum();
		double totalFilled = trips.stream().mapToDouble(t -> t.getBookedSeats()).sum();
		return totalCapacity > 0 ? (totalFilled / totalCapacity) * 100 : 0.0;
	}

	// --- Internal Mappers ---
	private BusDTO mapBusToDTO(Bus bus) {
		return BusDTO.builder()
				.id(bus.getId())
				.busNumber(bus.getBusNumber())
				.totalSeats(bus.getTotalSeats())
				.busType(bus.getBusType())
				.operatorId(bus.getOperator().getId())
				.operatorName(bus.getOperator().getName())
				.isActive(bus.getIsActive())
				.build();
	}

	private TripDTO mapTripToDTO(Trip trip) {
		return TripDTO.builder()
				.id(trip.getId())
				.source(trip.getRoute().getSource())
				.destination(trip.getRoute().getDestination())
				.journeyDate(trip.getJourneyDate())
				.departureTime(trip.getDepartureTime())
				.arrivalTime(trip.getArrivalTime().toLocalTime())
				.price(trip.getPrice())
				.status(trip.getStatus())
				.totalSeats(trip.getTotalSeats())
				.availableSeats(trip.getAvailableSeats())
				.bookedSeats(trip.getBookedSeats())
				.build();
	}

	private BookingItemDTO mapBookingItemToDTO(BookingItem item) {
		return BookingItemDTO.builder()
				.id(item.getId())
				.bookingId(item.getBooking().getId())
				.seatId(item.getSeat().getId())
				.seatNumber(item.getSeat().getSeatNumber())
				.passengerName(item.getPassengerName())
				.passengerAge(item.getPassengerAge())
				.passengerGender(item.getPassengerGender())
				.price(item.getPrice())
				.build();
	}
}
