package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.TripSearchRequest;
import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.dto.enums.BusType;
import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.repository.RouteRepository;
import com.bluebus.booking.repository.SeatAvailabilityRepository;
import com.bluebus.booking.repository.SeatRepository;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.service.EmailService;
import com.bluebus.booking.service.PaymentService;
import com.bluebus.booking.service.TripService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TripServiceImpl implements TripService {

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private BusRepository busRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private BookingRepository bookingRepository;
	
	@Autowired
	private SeatRepository seatRepository;

	@Autowired
	private SeatAvailabilityRepository seatAvailabilityRepository;

	@Autowired
	private PaymentService paymentService;

	@Override
	@Transactional
	public Trip createTrip(Trip trip) {

		if (trip.getRoute() == null || trip.getRoute().getId() == null) {
			throw new RuntimeException("Route is required");
		}
		if (trip.getBus() == null || trip.getBus().getId() == null) {
			throw new RuntimeException("Bus is required");
		}
		Route route = routeRepository.findById(trip.getRoute().getId())
				.orElseThrow(() -> new RuntimeException("Route not found"));

		Bus bus = busRepository.findById(trip.getBus().getId())
				.orElseThrow(() -> new RuntimeException("Bus not found"));

		trip.setRoute(route);
		trip.setBus(bus);
		
		if (trip.getPrice() == null || trip.getPrice().compareTo(java.math.BigDecimal.ZERO) == 0) {
			BigDecimal calculated = calculateFare(route.getDistance(), bus.getBusType());
			trip.setPrice(calculated);
			trip.setBasePrice(calculated);
		} else {
			// If price was manually set during creation, treat it as the base
			trip.setBasePrice(trip.getPrice());
		}

		if (trip.getStatus() == null) {
			trip.setStatus(TripStatus.SCHEDULED);
		}
		if (trip.getTotalSeats() == null || trip.getTotalSeats() == 0) {
			trip.setTotalSeats(bus.getTotalSeats());
		}
		trip.setBookedSeats(0);
		trip.setAvailableSeats(trip.getTotalSeats());
		
		Trip savedTrip = tripRepository.save(trip);
		initializeSeatsAndAvailability(savedTrip);
		return savedTrip;
	}

	private void initializeSeatsAndAvailability(Trip trip) {
		Bus bus = trip.getBus();
		List<com.bluebus.booking.entity.Seat> seatsToUse = new java.util.ArrayList<>(seatRepository.findByBusIdAndIsActiveTrue(bus.getId()));
		
		if (seatsToUse.isEmpty()) {
			int total = trip.getTotalSeats();
			boolean isSleeper = bus.getBusType() == BusType.SLEEPER || bus.getBusType() == BusType.VOLVO;
			int cols = isSleeper ? 3 : 4;
			
			// For sleepers, we split seats between Lower and Upper decks
			int seatsPerDeck = isSleeper ? (total / 2) : total;
			
			for (int i = 0; i < total; i++) {
				boolean isUpper = isSleeper && (i >= seatsPerDeck);
				int localIdx = isUpper ? (i - seatsPerDeck) : i;
				
				int row = (localIdx / cols) + 1;
				int col = (localIdx % cols) + 1;
				
				String deckPrefix = isSleeper ? (isUpper ? "U" : "L") : "L";
				String seatNum = String.format("%s%d%c", deckPrefix, row, (char)('A' + (col - 1)));
				
				com.bluebus.booking.entity.Seat seat = com.bluebus.booking.entity.Seat.builder()
						.bus(bus)
						.seatNumber(seatNum)
						.rowNumber(row)
						.columnNumber(col)
						.seatType(isSleeper ? com.bluebus.booking.dto.enums.BusSeatType.SLEEPER : com.bluebus.booking.dto.enums.BusSeatType.SEATER)
						.isActive(true)
						.build();
				seatsToUse.add(seatRepository.save(seat));
			}
		}
		
		List<com.bluebus.booking.entity.SeatAvailability> availabilities = new java.util.ArrayList<>();
		for (com.bluebus.booking.entity.Seat s : seatsToUse) {
			if (availabilities.size() >= trip.getTotalSeats()) break;
			
			availabilities.add(com.bluebus.booking.entity.SeatAvailability.builder()
					.trip(trip)
					.seat(s)
					.isBooked(false)
					.isLocked(false)
					.build());
		}
		seatAvailabilityRepository.saveAll(availabilities);
	}

	private java.math.BigDecimal calculateFare(Double distance, BusType type) {
		double baseRate = 2.5; // Base price per KM
		double multiplier = 1.0;

		switch (type) {
			case AC: multiplier = 1.3; break;
			case SLEEPER: multiplier = 1.6; break;
			case SEMI_SLEEPER: multiplier = 1.4; break;
			case VOLVO: multiplier = 2.0; break;
			case ELECTRIC: multiplier = 1.2; break;
			case NON_AC: multiplier = 1.0; break;
			case SEATER: multiplier = 1.0; break;
			default: multiplier = 1.0;
		}

		double calculated = distance * baseRate * multiplier;
		return java.math.BigDecimal.valueOf(calculated).setScale(2, java.math.RoundingMode.HALF_UP);
	}

	@Override
	public Trip getTripById(Long id) {
		return tripRepository.findById(id).orElseThrow(() -> new RuntimeException("Trip not found"));
	}

	@Override
	public List<Trip> getTripsByRoute(Long routeId) {
		return tripRepository.findByRouteIdAndStatus(routeId, TripStatus.SCHEDULED);
	}

	@Transactional
	@Override
	public Trip updateTrip(Long id, Trip updatedTrip) {
		Trip existing = getTripById(id);

		if (updatedTrip.getJourneyDate() != null) {
			existing.setJourneyDate(updatedTrip.getJourneyDate());
		}

		if (updatedTrip.getDepartureTime() != null) {
			existing.setDepartureTime(updatedTrip.getDepartureTime());
		}

		if (updatedTrip.getArrivalTime() != null) {
			existing.setArrivalTime(updatedTrip.getArrivalTime());
		}

		if (updatedTrip.getPrice() != null) {
			existing.setPrice(updatedTrip.getPrice());
		}

		return tripRepository.save(existing);
	}

	@Override
	public Trip cancelTrip(Long id) {
		Trip trip = getTripById(id);

		if (trip.getStatus() == TripStatus.CANCELLED) {
			throw new RuntimeException("Trip already cancelled");
		}

		LocalDateTime departureDateTime = LocalDateTime.of(trip.getJourneyDate(), trip.getDepartureTime());

		if (departureDateTime.isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Cannot cancel past trip");
		}

		trip.setStatus(TripStatus.CANCELLED);
		trip.setCancelledAt(LocalDateTime.now());

		return tripRepository.save(trip);
	}

	public List<Trip> searchTrips(TripSearchRequest req, int page, int size, String sortBy, String direction) {

		List<Trip> trips = tripRepository
				.findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateGreaterThanEqualAndStatus(
						req.getSource().trim(), req.getDestination().trim(), req.getDate(), TripStatus.SCHEDULED);

		// 🔥 FILTER: Only show trips that haven't departed yet
		trips = trips.stream().filter(t -> {
			LocalDateTime departureDateTime = LocalDateTime.of(t.getJourneyDate(), t.getDepartureTime());
			return departureDateTime.isAfter(LocalDateTime.now());
		}).toList();

		// 🔥 FILTERS (same as before)
		if (req.getMinPrice() != null) {
			trips = trips.stream().filter(t -> t.getPrice().compareTo(req.getMinPrice()) >= 0).toList();
		}

		if (req.getMaxPrice() != null) {
			trips = trips.stream().filter(t -> t.getPrice().compareTo(req.getMaxPrice()) <= 0).toList();
		}

		if (req.getBusType() != null) {
			trips = trips.stream().filter(t -> t.getBus().getBusType().name().equalsIgnoreCase(req.getBusType()))
					.toList();
		}

		// 🔥 SORTING
		Comparator<Trip> comparator;

		if (sortBy.equalsIgnoreCase("price")) {
			comparator = Comparator.comparing(Trip::getPrice);
		} else {
			comparator = Comparator.comparing(Trip::getDepartureTime);
		}

		if (direction.equalsIgnoreCase("desc")) {
			comparator = comparator.reversed();
		}

		trips = trips.stream().sorted(comparator).toList();

		// 🔥 PAGINATION
		int start = page * size;
		int end = Math.min(start + size, trips.size());

		if (start > trips.size())
			return List.of();

		return trips.subList(start, end);
	}

	@Override
	@Transactional
	public void cancelTripByAdmin(Long tripId, String reason) {
		log.info("Starting admin cancellation for trip {}", tripId);
		Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

		if (trip.getStatus() == TripStatus.CANCELLED) {
			log.warn("Trip {} is already cancelled. Skipping.", tripId);
			return;
		}

		LocalDateTime departureDateTime = LocalDateTime.of(trip.getJourneyDate(), trip.getDepartureTime());
		if (departureDateTime.isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Cannot cancel past trip");
		}

		// 1. Mark trip as cancelled immediately and flush to DB
		trip.setStatus(TripStatus.CANCELLED);
		trip.setCancelledAt(LocalDateTime.now());
		tripRepository.saveAndFlush(trip);
		log.info("Trip {} status marked as CANCELLED in database", tripId);

		List<Booking> bookings = bookingRepository.findByTripId(tripId);
		log.info("Found {} bookings for trip {}", bookings.size(), tripId);

		for (Booking booking : bookings) {
			if (booking.getStatus() == BookingStatus.CANCELLED) {
				continue;
			}

			boolean refundProcessed = false;
			if (booking.getStatus() == BookingStatus.CONFIRMED) {
				try {
					log.info("Processing refund for booking {}", booking.getId());
					paymentService.processRefund(booking.getId(), "Trip cancelled by admin: " + reason, true);
					refundProcessed = true;
				} catch (Exception e) {
					log.error("Refund failed for booking {}: {}. Will attempt manual cancellation.", booking.getId(), e.getMessage());
				}
			}

			if (!refundProcessed) {
				log.info("Manually cancelling booking {}", booking.getId());
				booking.setStatus(BookingStatus.CANCELLED);
				booking.setCancellationTime(LocalDateTime.now());
				bookingRepository.saveAndFlush(booking);

				try {
					emailService.sendBookingCancellation(
							booking.getContactEmail(),
							booking.getBookingReference(),
							trip.getRoute().getSource(),
							trip.getRoute().getDestination(),
							trip.getJourneyDate().toString()
					);
				} catch (Exception e) {
					log.error("Failed to send cancellation email for booking {}: {}", booking.getId(), e.getMessage());
				}
			}
		}

		log.info("Trip {} cancelled by admin successfully", tripId);
	}

	@Override
	public List<Trip> getAllTrips() {
		return tripRepository.findAll();
	}

}
