package com.bluebus.booking.serviceImpl;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.enums.Role;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		log.info("loadUserByUsername called with email: {}", email);
		try {
			User user = userRepository.findByEmail(email)
					.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

			// ✅ Dynamic Roles from User Entity
			Set<Role> userRoles = user.getRoles();
			if (userRoles == null || userRoles.isEmpty()) {
				userRoles = Set.of(Role.USER);
			}

			List<SimpleGrantedAuthority> authorities = userRoles.stream()
					.map(r -> new SimpleGrantedAuthority("ROLE_" + r.name())).collect(Collectors.toList());

			return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(),
					authorities);
		} catch (UsernameNotFoundException e) {
			log.error("UsernameNotFoundException in loadUserByUsername for email: {}", email, e);
			throw e;
		} catch (RuntimeException e) {
			log.error("RuntimeException in loadUserByUsername for email: {}", email, e);
			throw e;
		}
	}

}
