package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.Stop;

public interface StopRepository extends JpaRepository<Stop, Long> {
	boolean existsByRouteIdAndSequenceOrder(Long routeId, Integer sequenceOrder);

	List<Stop> findByRouteIdAndIsActiveTrueOrderBySequenceOrderAsc(Long routeId);

	List<Stop> findByRouteIdOrderBySequenceOrderAsc(Long routeId);

}
