package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.BusOperator;

public interface BusOperatorRepository extends JpaRepository<BusOperator, Long> {

	List<BusOperator> findByNameContainingIgnoreCase(String name);


}
