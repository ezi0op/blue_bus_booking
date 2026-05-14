package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.repository.BookingItemRepository;
import com.bluebus.booking.service.BookingItemService;

@Service
public class BookingItemServiceImpl implements BookingItemService {

	@Autowired
	private BookingItemRepository bookingItemRepository;

	
	@Override
	public List<BookingItem> getItemsByBooking(Long bookingId) {

		return bookingItemRepository.findByBookingId(bookingId);
	}

	@Override
	public BookingItem addBookingItem(BookingItem item) {

		return bookingItemRepository.save(item);
	}

	@Transactional
	@Override
	public int deleteBookingItem(Long id) {
		if (!bookingItemRepository.existsById(id)) {
			throw new RuntimeException("BookingItem not found");
		}

		return bookingItemRepository.deleteByIdCustom(id);

	}

}
