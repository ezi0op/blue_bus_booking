package com.bluebus.booking.service;

import com.bluebus.booking.dto.SeatPreferenceDTO;
import com.bluebus.booking.dto.enums.SeatType;

public interface SeatPreferenceService {

	SeatPreferenceDTO getPreference(Long userId);

	SeatType suggestSeatType(Long userId);

	void updatePreferenceFromBooking(Long userId, Long bookId);
	
	void syncAllPastBookings(Long userId);

}
