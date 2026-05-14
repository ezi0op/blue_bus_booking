package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BookingItemDTO;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.service.BookingItemService;

@RestController
@RequestMapping("/api/booking-items")
public class BookingItemController {

	@Autowired
	private BookingItemService bookingItemService;

	@GetMapping("/booking/{bookingId}")
	public ApiResponse<List<BookingItemDTO>> getItems(@PathVariable Long bookingId) {
		List<BookingItem> bookingItems = bookingItemService.getItemsByBooking(bookingId);

		List<BookingItemDTO> items = new ArrayList<>();

		for (BookingItem item : bookingItems) {
			BookingItemDTO dto = mapToDTO(item);
			items.add(dto);
		}
		return new ApiResponse<>(true, "Items fetched successfully", items);
	}

	@PostMapping
	public ApiResponse<BookingItemDTO> addItem(@RequestBody BookingItem item) {

		BookingItem saved = bookingItemService.addBookingItem(item);

		return new ApiResponse<>(true, "Item added", mapToDTO(saved));
	}

	@DeleteMapping("/{id}")
	public ApiResponse<String> deleteItem(@PathVariable Long id) {

		bookingItemService.deleteBookingItem(id);

		return new ApiResponse<>(true, "Item deleted successfully", null);
	}

	// 🔁 MAPPER
	private BookingItemDTO mapToDTO(BookingItem item) {
		return BookingItemDTO.builder().id(item.getId()).bookingId(item.getBooking().getId())
				.seatId(item.getSeat().getId()).seatNumber(item.getSeat().getSeatNumber())
				.passengerName(item.getPassengerName()).passengerAge(item.getPassengerAge())
				.passengerGender(item.getPassengerGender()).price(item.getPrice())
				.build();
	}

}
