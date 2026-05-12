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

	@Override
	public SeatPreferenceDTO getPreference(Long userId) {
		SeatPreference pref = seatPreferenceRepository.findByUserId(userId)
				.orElse(SeatPreference.builder().preferredSeatType(SeatType.NO_PREFERENCE)
						.preferredDeckType(DeckType.NO_PREFERENCE).windowCount(0).aisleCount(0).lowerBerthCount(0)
						.upperBerthCount(0).totalBookingsAnalysed(0).build());

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
				.orElse(SeatPreference.builder().preferredSeatType(SeatType.NO_PREFERENCE)
						.preferredDeckType(DeckType.NO_PREFERENCE).windowCount(0).aisleCount(0).lowerBerthCount(0)
						.upperBerthCount(0).totalBookingsAnalysed(0).build());
		// Update seat type count
		List<BookingItem> items = booking.getBookingItems();

		for (BookingItem item : items) {

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

}
