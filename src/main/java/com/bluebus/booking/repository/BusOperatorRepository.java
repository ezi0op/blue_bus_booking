package com.bluebus.booking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.BusOperator;

public interface BusOperatorRepository extends JpaRepository<BusOperator, Long> {

	List<BusOperator> findByNameContainingIgnoreCase(String name);

	// Add these to your existing BusOperatorRepository or UserRepository
	Optional<BusOperator> findByContactEmail(String email);
	boolean existsByContactEmail(String email);
}
