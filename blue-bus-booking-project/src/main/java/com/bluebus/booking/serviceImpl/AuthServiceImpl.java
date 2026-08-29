package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.EmailVerificationToken;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.EmailVerificationTokenRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.security.util.JwtUtil;
import com.bluebus.booking.service.AuthService;
import com.bluebus.booking.service.EmailService;
import com.bluebus.booking.service.TokenBlacklistService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private EmailService emailService;

	@Autowired
	private TokenBlacklistService tokenBlacklistService;

	@Override
	public String login(String email, String password) {
		log.info("login called for email: {}", email);
		try {
			User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Invalid email"));

			if (!passwordEncoder.matches(password, user.getPassword())) {
				throw new RuntimeException("Invalid password");
			}

			if (!user.getIsVerified()) {
				throw new RuntimeException("Please verify your email before login");
			}

			return jwtUtil.generateToken(email);
		} catch (Exception e) {
			log.error("Error in login for email: {}", email, e);
			throw e;
		}
	}

	@Override
	public boolean changePassword(String email, String oldPassword, String newPassword) {
		log.info("changePassword called for email: {}", email);
		try {
			User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

			// old password check
			if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
				throw new RuntimeException("Old password is incorrect");
			}

			// save new hashed password
			user.setPassword(passwordEncoder.encode(newPassword));

			userRepository.save(user);

			return true;
		} catch (Exception e) {
			log.error("Error in changePassword for email: {}", email, e);
			throw e;
		}
	}

	@Override
	public User registerUser(User user) {
		log.info("registerUser called for email: {}", user != null ? user.getEmail() : "null");
		try {
			// prevent duplicate email
			if (userRepository.findByEmail(user.getEmail()).isPresent()) {
				throw new RuntimeException("Email already exists");
			}

			//  Hash password before save
			user.setPassword(passwordEncoder.encode(user.getPassword()));
			user.setIsVerified(false); // add this
			user.setIsActive(true); // optional good practice

			User savedUser = userRepository.save(user);

			// Generate verification token
			String token = UUID.randomUUID().toString();

			EmailVerificationToken verificationToken = EmailVerificationToken.builder().token(token).user(savedUser)
					.expiryDate(LocalDateTime.now().plusHours(24)).used(false).build();

			emailVerificationTokenRepository.save(verificationToken);

			// Send verification email
			emailService.sendVerificationEmail(savedUser.getEmail(), token);

			emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());

			return savedUser;
		} catch (Exception e) {
			log.error("Error in registerUser for email: {}", user != null ? user.getEmail() : "null", e);
			throw e;
		}
	}

	@Override
	public User getUserByEmail(String email) {
		log.info("getUserByEmail called with email: {}", email);
		try {
			return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
		} catch (Exception e) {
			log.error("Error in getUserByEmail with email: {}", email, e);
			throw e;
		}
	}

	@Override
	public User getByEmail(String email) {
		log.info("getByEmail called with email: {}", email);
		try {
			return getUserByEmail(email);
		} catch (Exception e) {
			log.error("Error in getByEmail with email: {}", email, e);
			throw e;
		}
	}

	@Override
	public void logout(String token) {
		log.info("logout called");
		try {
			tokenBlacklistService.blacklistToken(token);
		} catch (Exception e) {
			log.error("Error in logout", e);
			throw e;
		}
	}

	@Override
	@Transactional
	public void resendVerificationEmail(String email) {
		log.info("resendVerificationEmail called for email: {}", email);
		try {
			User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

			if (user.getIsVerified()) {
				throw new RuntimeException("Email is already verified");
			}

			// Delete old unused tokens to avoid duplicate key error
			emailVerificationTokenRepository.deleteByUser(user);
			emailVerificationTokenRepository.flush();

			String token = UUID.randomUUID().toString();

			EmailVerificationToken verificationToken = EmailVerificationToken.builder().token(token).user(user)
					.expiryDate(LocalDateTime.now().plusHours(24)).used(false).build();

			emailVerificationTokenRepository.saveAndFlush(verificationToken);

			// Send verification email
			emailService.sendVerificationEmail(user.getEmail(), token);
		} catch (Exception e) {
			log.error("Error in resendVerificationEmail for email: {}", email, e);
			throw e;
		}
	}

}
