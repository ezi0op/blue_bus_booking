package com.bluebus.booking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bluebus.booking.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByEmail(String email);

	boolean existsByPhone(String phone);

	Optional<User> findByEmail(String email);
	
	Optional<User> findByResetPasswordToken(String token);

}
