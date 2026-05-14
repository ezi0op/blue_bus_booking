package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bluebus.booking.entity.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {

	List<Seat> findByBusIdAndIsActiveTrue(Long busId);

	@Query("Select count(s)>0 from Seat s where s.bus.id = :busId and LOWER(s.seatNumber)=LOWER(:seatNumber)")
	boolean existsByBusIdAndSeatNumber(@Param("busId") Long busId,@Param("seatNumber") String seatNumber);
	

}
