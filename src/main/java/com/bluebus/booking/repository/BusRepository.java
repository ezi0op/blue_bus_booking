package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Bus;

public interface BusRepository extends JpaRepository<Bus, Long> {

	List<Bus> findByOperatorId(Long operatorId);

	@Modifying
	@Transactional
	@Query("UPDATE Bus b SET b.isActive = false WHERE b.id = :id AND b.isActive = true")
	int deactivateBus(@Param("id") Long id);

	@Query("SELECT COUNT(DISTINCT b.operator.id) FROM Bus b")
	Long countDistinctBusOperators();

}
