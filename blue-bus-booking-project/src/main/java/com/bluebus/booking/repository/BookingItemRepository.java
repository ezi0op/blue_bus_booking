package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bluebus.booking.entity.BookingItem;

public interface BookingItemRepository extends JpaRepository<BookingItem, Long> {

	@Query("SELECT bi FROM BookingItem bi JOIN FETCH bi.seat WHERE bi.booking.id = :bookingId")
	List<BookingItem> findByBookingId(Long bookingId);

	@Modifying
	@Query("DELETE FROM BookingItem b WHERE b.id = :id")
	int deleteByIdCustom(@Param("id") Long id);

}
