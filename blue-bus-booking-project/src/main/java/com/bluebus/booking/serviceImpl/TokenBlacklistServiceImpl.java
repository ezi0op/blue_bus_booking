package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.BlacklistedToken;
import com.bluebus.booking.repository.BlacklistedTokenRepository;
import com.bluebus.booking.service.TokenBlacklistService;

@Service
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

	@Autowired
	private BlacklistedTokenRepository blacklistedTokenRepository;

	@Override
	public void blacklistToken(String token) {
		if (!blacklistedTokenRepository.existsByToken(token)) {
			BlacklistedToken blacklistedToken = BlacklistedToken.builder().token(token)
					.blacklistedAt(LocalDateTime.now()).build();

			blacklistedTokenRepository.save(blacklistedToken);
		}

	}

	@Override
	public boolean isBlackListed(String token) {

		return blacklistedTokenRepository.existsByToken(token);
	}

}
