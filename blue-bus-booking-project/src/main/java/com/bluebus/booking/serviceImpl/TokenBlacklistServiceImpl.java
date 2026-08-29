package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.BlacklistedToken;
import com.bluebus.booking.repository.BlacklistedTokenRepository;
import com.bluebus.booking.service.TokenBlacklistService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

	@Autowired
	private BlacklistedTokenRepository blacklistedTokenRepository;

	@Override
	public void blacklistToken(String token) {
		log.info("blacklistToken called");
		try {
			if (!blacklistedTokenRepository.existsByToken(token)) {
				BlacklistedToken blacklistedToken = BlacklistedToken.builder().token(token)
						.blacklistedAt(LocalDateTime.now()).build();

				blacklistedTokenRepository.save(blacklistedToken);
			}
		} catch (Exception e) {
			log.error("Error in blacklistToken", e);
			throw e;
		}
	}

	@Override
	public boolean isBlackListed(String token) {
		log.info("isBlackListed called");
		try {
			return blacklistedTokenRepository.existsByToken(token);
		} catch (Exception e) {
			log.error("Error in isBlackListed", e);
			throw e;
		}
	}

}
