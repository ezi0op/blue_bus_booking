package com.bluebus.booking.controller.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BookingItemDTO;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.service.BookingItemService;

@RestController
@RequestMapping("/api/admin/booking-items")
public class AdminBookingItemController {

	@Autowired
	private BookingItemService bookingItemService;

	// 📋 GET ITEMS BY BOOKING
	@GetMapping("/booking/{bookingId}")
	public ApiResponse<List<BookingItemDTO>> getItems(@PathVariable Long bookingId) {

		List<BookingItem> bookingItems = bookingItemService.getItemsByBooking(bookingId);

		List<BookingItemDTO> items = new ArrayList<>();

		for (BookingItem item : bookingItems) {
			items.add(mapToDTO(item));
		}

		return new ApiResponse<>(true, "Items fetched", items);
	}

	// ❌ FORCE DELETE ITEM
	@DeleteMapping("/{id}")
	public ApiResponse<String> deleteItem(@PathVariable Long id) {

		bookingItemService.deleteBookingItem(id);

		return new ApiResponse<>(true, "Item deleted by admin", null);
	}

	private BookingItemDTO mapToDTO(BookingItem item) {

		return BookingItemDTO.builder().id(item.getId()).bookingId(item.getBooking().getId())
				.seatId(item.getSeat().getId()).seatNumber(item.getSeat().getSeatNumber())
				.passengerName(item.getPassengerName()).passengerAge(item.getPassengerAge())
				.passengerGender(item.getPassengerGender()).price(item.getPrice())
				.build();
	}
}