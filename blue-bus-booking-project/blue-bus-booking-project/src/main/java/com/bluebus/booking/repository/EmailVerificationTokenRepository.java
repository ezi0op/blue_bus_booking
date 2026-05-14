package com.bluebus.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.EmailVerificationToken;
import com.bluebus.booking.entity.User;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

	Optional<EmailVerificationToken> findByToken(String token);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM EmailVerificationToken t WHERE t.user = :user")
	void deleteByUser(User user);
}