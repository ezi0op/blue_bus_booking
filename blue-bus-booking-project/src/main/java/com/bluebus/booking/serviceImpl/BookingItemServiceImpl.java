package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.repository.BookingItemRepository;
import com.bluebus.booking.service.BookingItemService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookingItemServiceImpl implements BookingItemService {

	@Autowired
	private BookingItemRepository bookingItemRepository;

	
	@Override
	public List<BookingItem> getItemsByBooking(Long bookingId) {
		log.info("getItemsByBooking called with bookingId: {}", bookingId);
		try {
			return bookingItemRepository.findByBookingId(bookingId);
		} catch (Exception e) {
			log.error("Error in getItemsByBooking with bookingId: {}", bookingId, e);
			throw e;
		}
	}

	@Override
	public BookingItem addBookingItem(BookingItem item) {
		log.info("addBookingItem called with item: {}", item);
		try {
			return bookingItemRepository.save(item);
		} catch (Exception e) {
			log.error("Error in addBookingItem with item: {}", item, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public int deleteBookingItem(Long id) {
		log.info("deleteBookingItem called with id: {}", id);
		try {
			if (!bookingItemRepository.existsById(id)) {
				throw new RuntimeException("BookingItem not found");
			}
			return bookingItemRepository.deleteByIdCustom(id);
		} catch (Exception e) {
			log.error("Error in deleteBookingItem with id: {}", id, e);
			throw e;
		}
	}

}
