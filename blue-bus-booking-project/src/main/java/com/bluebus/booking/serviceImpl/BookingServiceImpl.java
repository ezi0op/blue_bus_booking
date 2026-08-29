package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.CreateBookingRequest;
import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.entity.SeatAvailability;
import com.bluebus.booking.entity.Trip;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.SeatAvailabilityRepository;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.BookingService;
import com.bluebus.booking.service.EmailService;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookingServiceImpl implements BookingService {

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private SeatAvailabilityRepository seatAvailabilityRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private com.bluebus.booking.service.PaymentService paymentService;

	@Autowired
	private com.bluebus.booking.service.SeatPreferenceService seatPreferenceService;

	@Override
	@Transactional
	public Booking createBooking(CreateBookingRequest request) {
		log.info("createBooking called with request: {}", request);
		try {
			User user = userRepository.findById(request.getUserId())
					.orElseThrow(() -> new RuntimeException("User not found"));

			Trip trip = tripRepository.findById(request.getTripId())
					.orElseThrow(() -> new RuntimeException("Trip not found"));

			// ✅ CREATE BOOKING FIRST
			Booking booking = Booking.builder().user(user).trip(trip).bookingReference(generateBookingReference())
					.status(BookingStatus.PENDING).bookingTime(LocalDateTime.now()).contactEmail(request.getContactEmail())
					.contactPhone(request.getContactPhone()).totalAmount(BigDecimal.ZERO).finalAmount(BigDecimal.ZERO)
					.discountAmount(BigDecimal.ZERO).build();

			booking = bookingRepository.save(booking);

			BigDecimal total = BigDecimal.ZERO;
			List<BookingItem> items = new java.util.ArrayList<>();

			for (var p : request.getPassengers()) {

				SeatAvailability seat = seatAvailabilityRepository.findWithLock(request.getTripId(), p.getSeatId())
						.orElseThrow(() -> new RuntimeException("Seat not found"));

				if (seat.getIsBooked()) {
					throw new RuntimeException("Seat already booked");
				}

				if (seat.getIsLocked()) {
					// If the seat is locked but not booked, we allow the booking to proceed.
					// The lock was likely placed by this same user during seat selection.
					if (seat.getLockExpiryTime() != null && seat.getLockExpiryTime().isBefore(LocalDateTime.now())) {
						// expired → release it first (optional since we're about to lock/book it anyway)
						seat.setIsLocked(false);
						seat.setLockTime(null);
						seat.setLockExpiryTime(null);
					}
				}

				// lock seat
				seat.setIsLocked(true);
				seat.setLockTime(LocalDateTime.now());
				seat.setLockExpiryTime(LocalDateTime.now().plusMinutes(5));

				seat.setBooking(booking);

				seatAvailabilityRepository.save(seat);

				total = total.add(trip.getPrice());

				BookingItem item = BookingItem.builder().booking(booking).seat(seat.getSeat()).price(trip.getPrice())
						.passengerName(p.getName()).passengerAge(p.getAge()).passengerGender(p.getGender()).build();

				items.add(item);
			}

			booking.setTotalAmount(total);
			
			BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
			booking.setDiscountAmount(discount);
			booking.setAppliedCouponCode(request.getCouponCode());
			
			BigDecimal finalAmt = total.subtract(discount);
			if(finalAmt.compareTo(BigDecimal.ZERO) < 0) finalAmt = BigDecimal.ZERO;
			booking.setFinalAmount(finalAmt);
			
			booking.setBookingItems(items);
			booking = bookingRepository.save(booking);
			
			// 📧 Send email with explicit strings (avoid lazy loading issues in async)
			emailService.sendBookingConfirmation(
					booking.getContactEmail(), 
					booking.getBookingReference(), 
					booking.getTrip().getRoute().getSource(), 
					booking.getTrip().getRoute().getDestination(), 
					booking.getTrip().getJourneyDate().toString()
			);

			// 🔥 CRITICAL: Eagerly load fields for the controller DTO mapping 
			// because the transaction ends here and Hibernate session will close.
			booking.getBookingItems().forEach(item -> {
				item.getSeat().getSeatNumber(); // Load seat
			});
			booking.getUser().getName(); // Load user
			booking.getTrip().getId(); // Load trip

			return booking;
		} catch (Exception e) {
			log.error("Error in createBooking with request: {}", request, e);
			throw e;
		}
	}

	@Override
	public Booking getBookingById(Long id) {
		log.info("getBookingById called with id: {}", id);
		try {
			return bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
		} catch (Exception e) {
			log.error("Error in getBookingById with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<Booking> getBookingsByUser(Long userId) {
		log.info("getBookingsByUser called with userId: {}", userId);
		try {
			return bookingRepository.findByUserId(userId);
		} catch (Exception e) {
			log.error("Error in getBookingsByUser with userId: {}", userId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Booking confirmBooking(Long bookingId) {
		log.info("confirmBooking called with bookingId: {}", bookingId);
		try {
			Booking booking = getBookingById(bookingId);

			if (booking.getStatus() != BookingStatus.PENDING) {
				throw new RuntimeException("Booking already processed");
			}

			List<BookingItem> items = booking.getBookingItems();

			for (BookingItem item : items) {

				SeatAvailability seat = seatAvailabilityRepository
						.findByTripIdAndSeatId(booking.getTrip().getId(), item.getSeat().getId())
						.orElseThrow(() -> new RuntimeException("Seat not found"));
				if (!seat.getIsLocked()) {
					throw new RuntimeException("Seat not locked");
				}

				if (seat.getLockExpiryTime() == null || seat.getLockExpiryTime().isBefore(LocalDateTime.now())) {
					throw new RuntimeException("Seat lock expired");
				}
				seat.setIsLocked(false);
				seat.setIsBooked(true);
				seat.setLockTime(null);
				seat.setLockExpiryTime(null);
				seat.setBooking(booking);
				seatAvailabilityRepository.save(seat);

			}
			booking.setStatus(BookingStatus.CONFIRMED);
			booking = bookingRepository.save(booking);

			// 🔥 AI ANALYTICS: Update Seat Preference after confirmation
			try {
				seatPreferenceService.updatePreferenceFromBooking(booking.getUser().getId(), booking.getId());
			} catch (Exception e) {
				// Don't fail confirmation if analytics fail
			}

			return booking;
		} catch (Exception e) {
			log.error("Error in confirmBooking with bookingId: {}", bookingId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Booking cancelBooking(Long bookingId, boolean isFullRefund) {
		log.info("cancelBooking called with bookingId: {}, isFullRefund: {}", bookingId, isFullRefund);
		try {
			Booking booking = getBookingById(bookingId);

			if (booking.getStatus() == BookingStatus.CANCELLED) {
				throw new RuntimeException("Booking already cancelled");
			}


			// If payment was completed, use the payment service to process refund + cancellation
			if (booking.getPaymentCompleted()) {
				paymentService.processRefund(bookingId, "Cancellation requested", isFullRefund);
				return getBookingById(bookingId); // Return the updated booking
			}

			// Otherwise, manually cancel and release seats (for PENDING or unpaid bookings)
			List<BookingItem> items = booking.getBookingItems();
			for (BookingItem item : items) {
				seatAvailabilityRepository.findByTripIdAndSeatId(booking.getTrip().getId(), item.getSeat().getId())
						.ifPresent(seat -> {
							seat.setIsBooked(false);
							seat.setIsLocked(false);
							seat.setLockTime(null);
							seat.setLockExpiryTime(null);
							seat.setBooking(null);
							seatAvailabilityRepository.save(seat);
						});
			}

			booking.setStatus(BookingStatus.CANCELLED);
			booking.setCancellationTime(LocalDateTime.now());
			booking = bookingRepository.save(booking);
			
			// Send cancellation email (No refund)
			emailService.sendBookingCancellation(
					booking.getContactEmail(), 
					booking.getBookingReference(), 
					booking.getTrip().getRoute().getSource(), 
					booking.getTrip().getRoute().getDestination(), 
					booking.getTrip().getJourneyDate().toString()
			);
			
			return booking;
		} catch (Exception e) {
			log.error("Error in cancelBooking with bookingId: {}, isFullRefund: {}", bookingId, isFullRefund, e);
			throw e;
		}
	}

	@Override
	public List<Booking> getAllBookings() {
		log.info("getAllBookings called");
		try {
			return bookingRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllBookings", e);
			throw e;
		}
	}

	// Generate PNR
	@Override
	public String generateBookingReference() {
		log.info("generateBookingReference called");
		try {
			return "BB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
		} catch (Exception e) {
			log.error("Error in generateBookingReference", e);
			throw e;
		}
	}

	@Override
	public Booking getBookingByReference(String reference) {
		log.info("getBookingByReference called with reference: {}", reference);
		try {
			return bookingRepository.findByBookingReference(reference).orElse(null);
		} catch (Exception e) {
			log.error("Error in getBookingByReference with reference: {}", reference, e);
			throw e;
		}
	}

}
