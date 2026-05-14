package com.bluebus.booking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.entity.Route;

public interface RouteRepository extends JpaRepository<Route, Long> {

	@Query("""
				SELECT r
				FROM Route r
				WHERE
					UPPER(TRIM(r.source)) LIKE UPPER(CONCAT('%', TRIM(:source), '%'))
				AND
					UPPER(TRIM(r.destination)) LIKE UPPER(CONCAT('%', TRIM(:destination), '%'))
				AND
					r.isActive = true
			""")
	List<Route> findBySourceContainingIgnoreCaseAndDestinationContainingIgnoreCase(String source, String destination);

	List<Route> findByIsActiveTrue();

	@Query("""
			SELECT DISTINCT t.route
			FROM Trip t
			WHERE t.bus.id = :busId
			""")
	List<Route> findByDistinctRouteByBusId(Long busId);

}
