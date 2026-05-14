package com.bluebus.booking.security.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.bluebus.booking.security.filter.JwtFilter;

import java.util.Arrays;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

/**
 * Security Configuration for Blue Bus Booking Application
 * 
 * Features:
 * - JWT Token-based Authentication
 * - CORS Configuration for web clients
 * - Role-based Access Control
 * - Stateless Session Management
 * - CSRF Protection Disabled (for REST API)
 * - BCrypt Password Hashing (strength: 12)
 * 
 * @author Blue Bus Development Team
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private JwtFilter jwtFilter;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// 🟢 Public endpoints - no authentication required
						.requestMatchers("/api/maps/**").permitAll()
						.requestMatchers("/api/ai/**").permitAll()
						.requestMatchers("/api/recommendations/**").permitAll()
						.requestMatchers("/api/smart-search/**").permitAll()
						.requestMatchers("/api/seat-preference/**").permitAll()
						.requestMatchers("/api/auth/**").permitAll()
						.requestMatchers("/api/trips/**").permitAll()
						.requestMatchers("/api/buses/**").permitAll()
						.requestMatchers("/api/routes/**").permitAll()
						.requestMatchers("/api/stops/**").permitAll()
						.requestMatchers("/api/operators/**").permitAll()
						.requestMatchers("/api/seat-availability/layout/**").permitAll()
						.requestMatchers("/api/ticket/qr/**").permitAll()

						// 🔒 Admin endpoints - ADMIN role required
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// 🔒 Authenticated user endpoints
						.requestMatchers("/api/bookings/**").authenticated()
						.requestMatchers("/api/users/**").authenticated()
						.requestMatchers("/api/seats/**").authenticated()
						.requestMatchers("/api/seat-availability/**").authenticated()

						.requestMatchers("/api/booking-items/**").authenticated()
						.requestMatchers("/api/payments/**").authenticated()
						.requestMatchers("/api/invoices/**").authenticated()
						.requestMatchers("/api/tickets/**").authenticated()
						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/coupons").permitAll()
						.requestMatchers("/api/coupons/**").authenticated()

						// 🚫 Everything else requires authentication
						.anyRequest().authenticated());

		// Add JWT filter before Spring Security's authentication filter
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		// BCrypt with strength 12 (recommended for security)
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	/**
	 * CORS Configuration Source
	 * 
	 * Allowed Origins: localhost:3000, localhost:4200, 127.0.0.1:3000
	 * Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
	 * Max Age: 3600 seconds (1 hour)
	 * Credentials: Enabled
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(
				Arrays.asList(
					"http://localhost:3000", 
					"http://localhost:4200", 
					"http://127.0.0.1:3000", 
					"http://localhost:5173",
					"https://bluebusbooking.duckdns.org",
					"https://bluebusbooking.vercel.app"
				));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}
