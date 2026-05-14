package com.bluebus.booking.security.util;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

	private final String SECRET_KEY = "MckIpShKAHjg1PNRJxaaxTrrWOuxJAFoa5Ca9vHSjD5";

	private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

	private SecretKey getKey() {
		return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
	}

	// Generate TokenP
	public String generateToken(String email) {
		return Jwts.builder().subject(email).issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)).signWith(getKey()).compact();
	}

	// extract email
	public String extractEmail(String token) {
		return getClaims(token).getSubject();
	}

	// validate Token
	public boolean validateToken(String token) {
		return getClaims(token).getExpiration().after(new Date());
	}

	// ✅ Parse Claims
	private Claims getClaims(String token) {
		return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();
	}

}
