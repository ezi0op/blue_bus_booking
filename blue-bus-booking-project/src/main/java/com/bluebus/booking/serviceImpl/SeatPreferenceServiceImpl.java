package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.SeatPreferenceDTO;
import com.bluebus.booking.dto.enums.DeckType;
import com.bluebus.booking.dto.enums.SeatType;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.entity.SeatPreference;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.SeatPreferenceRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.SeatPreferenceService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SeatPreferenceServiceImpl implements SeatPreferenceService {

	@Autowired
	private SeatPreferenceRepository seatPreferenceRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	@org.springframework.context.annotation.Lazy
	private SeatPreferenceService self;

	@Override
	@Transactional
	public SeatPreferenceDTO getPreference(Long userId) {
		SeatPreference pref = seatPreferenceRepository.findByUserId(userId).orElse(null);
		
		// If no analytics data exists yet, try to sync from history once
		if (pref == null || pref.getTotalBookingsAnalysed() == 0) {
			log.info("No AI insights found for user {}. Triggering auto-sync...", userId);
			self.syncAllPastBookings(userId);
			pref = seatPreferenceRepository.findByUserId(userId).orElse(null);
		}

		if (pref == null) {
			return SeatPreferenceDTO.builder()
					.preferredSeatType(SeatType.NO_PREFERENCE)
					.preferredDeckType(com.bluebus.booking.dto.enums.DeckType.NO_PREFERENCE)
					.windowCount(0).aisleCount(0).lowerBerthCount(0).upperBerthCount(0)
					.totalBookingsAnalysed(0).build();
		}

		return SeatPreferenceDTO.builder().preferredSeatType(pref.getPreferredSeatType())
				.preferredDeckType(pref.getPreferredDeckType()).windowCount(pref.getWindowCount())
				.aisleCount(pref.getAisleCount()).lowerBerthCount(pref.getLowerBerthCount())
				.upperBerthCount(pref.getUpperBerthCount()).totalBookingsAnalysed(pref.getTotalBookingsAnalysed())
				.build();
	}

	@Override
	@Transactional
	public void updatePreferenceFromBooking(Long userId, Long bookId) {
		Booking booking = bookingRepository.findById(bookId)
				.orElseThrow(() -> new RuntimeException("Booking not found"));

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		SeatPreference pref = seatPreferenceRepository.findByUserId(userId)
				.orElseGet(() -> SeatPreference.builder()
						.user(user)
						.preferredSeatType(SeatType.NO_PREFERENCE)
						.preferredDeckType(DeckType.NO_PREFERENCE)
						.windowCount(0).aisleCount(0).lowerBerthCount(0)
						.upperBerthCount(0).totalBookingsAnalysed(0).build());
		// Update seat type count
		List<BookingItem> items = booking.getBookingItems();

		for (BookingItem item : items) {
			log.info("Analysing seat {} for user {}. Window: {}, Aisle: {}", 
					item.getSeat().getSeatNumber(), userId, item.getSeat().getIsWindow(), item.getSeat().getIsAisle());

			if (Boolean.TRUE.equals(item.getSeat().getIsWindow())) {
				pref.setWindowCount(pref.getWindowCount() + 1);
			}

			if (Boolean.TRUE.equals(item.getSeat().getIsAisle())) {
				pref.setAisleCount(pref.getAisleCount() + 1);
			}

			// Example rule:
			// row 1-2 → lower berth
			if (item.getSeat().getRowNumber() <= 2) {
				pref.setLowerBerthCount(pref.getLowerBerthCount() + 1);
			} else {
				pref.setUpperBerthCount(pref.getUpperBerthCount() + 1);
			}
		}

		// Total analysed bookings
		pref.setTotalBookingsAnalysed(pref.getTotalBookingsAnalysed() + 1);

		// Recalculate dominant preference
		pref.setPreferredSeatType(pref.getWindowCount() >= pref.getAisleCount() ? SeatType.WINDOW : SeatType.AISLE);
		pref.setPreferredDeckType(
				pref.getLowerBerthCount() >= pref.getUpperBerthCount() ? DeckType.LOWER : DeckType.UPPER);

		seatPreferenceRepository.save(pref);

		log.info("Seat preference updated for user {}", userId);
	}

	@Override
	public SeatType suggestSeatType(Long userId) {

		return seatPreferenceRepository.findByUserId(userId).map(SeatPreference::getPreferredSeatType)
				.orElse(SeatType.NO_PREFERENCE);
	}

	@Override
	@Transactional
	public void syncAllPastBookings(Long userId) {
		List<Booking> bookings = bookingRepository.findByUserId(userId);
		log.info("Starting AI Sync for user {}. Total bookings found in history: {}", userId, bookings.size());
		
		User user = userRepository.findById(userId).orElse(null);
		if (user == null) {
			log.warn("Cannot sync seat preferences for non-existent user {}", userId);
			return;
		}

		SeatPreference pref = seatPreferenceRepository.findByUserId(userId)
				.orElseGet(() -> SeatPreference.builder()
						.user(user)
						.preferredSeatType(SeatType.NO_PREFERENCE)
						.preferredDeckType(DeckType.NO_PREFERENCE)
						.windowCount(0).aisleCount(0).lowerBerthCount(0).upperBerthCount(0)
						.totalBookingsAnalysed(0).build());

		pref.setWindowCount(0);
		pref.setAisleCount(0);
		pref.setLowerBerthCount(0);
		pref.setUpperBerthCount(0);
		pref.setTotalBookingsAnalysed(0);
		pref.setPreferredSeatType(SeatType.NO_PREFERENCE);
		pref.setPreferredDeckType(DeckType.NO_PREFERENCE);
		
		seatPreferenceRepository.save(pref);

		int processedCount = 0;
		for (Booking b : bookings) {
			log.info("Checking booking {} status: {}", b.getBookingReference(), b.getStatus());
			if (b.getStatus() == com.bluebus.booking.dto.enums.BookingStatus.CONFIRMED || b.getStatus() == com.bluebus.booking.dto.enums.BookingStatus.PENDING) {
				self.updatePreferenceFromBooking(userId, b.getId());
				processedCount++;
			}
		}
		
		log.info("AI Sync complete for user {}. Total bookings processed: {}", userId, processedCount);
	}

}
