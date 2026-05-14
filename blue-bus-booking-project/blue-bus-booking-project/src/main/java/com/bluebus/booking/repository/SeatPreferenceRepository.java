package com.bluebus.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.bluebus.booking.dto.enums.SeatType;
import com.bluebus.booking.entity.SeatPreference;

public interface SeatPreferenceRepository extends JpaRepository<SeatPreference, Long> {

	Optional<SeatPreference> findByUserId(Long userId);

	@Query("""
			SELECT sp.preferredSeatType
			FROM SeatPreference sp
			GROUP BY sp.preferredSeatType
			ORDER BY COUNT(sp.id) DESC
			LIMIT 1
			""")
	SeatType findMostPreferredSeatType();

}
