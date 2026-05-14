package com.bluebus.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.BlacklistedToken;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, Long> {

	Optional<BlacklistedToken> findByToken(String token);

	boolean existsByToken(String token);
}