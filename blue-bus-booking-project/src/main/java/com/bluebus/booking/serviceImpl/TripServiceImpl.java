package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.TripSearchRequest;
import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.dto.enums.TripStatus;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.repository.RouteRepository;
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
	private PaymentService paymentService;

	@Override
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
		if (trip.getStatus() == null) {
			trip.setStatus(TripStatus.SCHEDULED);
		}
		if (trip.getTotalSeats() == null) {
			trip.setTotalSeats(bus.getTotalSeats());
		}
		trip.setBookedSeats(0);
		trip.setAvailableSeats(trip.getTotalSeats());
		return tripRepository.save(trip);
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
				.findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndJourneyDateAndStatus(
						req.getSource().trim(), req.getDestination().trim(), req.getDate(), TripStatus.SCHEDULED);

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
		Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));

		if (trip.getStatus() == TripStatus.CANCELLED) {
			throw new RuntimeException("Trip already cancelled");
		}

		LocalDateTime departureDateTime = LocalDateTime.of(trip.getJourneyDate(), trip.getDepartureTime());
		if (departureDateTime.isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Cannot cancel past trip");
		}

		trip.setStatus(TripStatus.CANCELLED);
		trip.setCancelledAt(LocalDateTime.now());

		List<Booking> bookings = bookingRepository.findByTripId(tripId);

		for (Booking booking : bookings) {

			if (booking.getStatus() != BookingStatus.CONFIRMED) {
				continue;
			}

			booking.setStatus(BookingStatus.CANCELLED);
			booking.setCancellationTime(LocalDateTime.now());

			try {
				paymentService.processRefund(booking.getId(), "Trip cancelled by admin: " + reason);
			} catch (Exception e) {
				log.error("Refund failed for booking {}", booking.getId());
			}

			emailService.sendBookingCancellation(booking);

			bookingRepository.save(booking);
		}

		tripRepository.save(trip);

		log.info("Trip {} cancelled by admin successfully", tripId);

	}

}
