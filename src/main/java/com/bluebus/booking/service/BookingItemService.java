package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.BookingItem;

public interface BookingItemService {
	List<BookingItem> getItemsByBooking(Long bookingId);

	BookingItem addBookingItem(BookingItem item);

	int deleteBookingItem(Long id);
}
