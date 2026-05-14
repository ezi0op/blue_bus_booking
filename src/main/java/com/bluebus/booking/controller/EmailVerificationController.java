package com.bluebus.booking.controller;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.Map;

import com.bluebus.booking.entity.EmailVerificationToken;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.EmailVerificationTokenRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class EmailVerificationController {

	@Autowired
	private EmailVerificationTokenRepository emailVerificationTokenRepository;

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private AuthService authService;

	@GetMapping("/verify/{token}")
	public String verifyEmail(@PathVariable String token) {

		EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
				.orElseThrow(() -> new RuntimeException("Invalid verification token"));

		if (verificationToken.getUsed()) {
			return "Email is already verified. You can proceed to login.";
		}

		if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Verification token expired");
		}

		User user = verificationToken.getUser();

		user.setIsVerified(true);
		userRepository.save(user);

		verificationToken.setUsed(true);
		emailVerificationTokenRepository.save(verificationToken);

		return "Email verified successfully. You can now login.";
	}
	
	@PostMapping("/resend-verification")
	public ResponseEntity<?> resendVerification(@RequestParam String email) {
		authService.resendVerificationEmail(email);
		return ResponseEntity.ok(Map.of("success", true, "message", "Verification email sent successfully"));
	}
}