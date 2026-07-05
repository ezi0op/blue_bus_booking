package com.bluebus.booking.controller;

import java.util.HashSet;
import java.util.Set;

import com.bluebus.booking.dto.enums.Role;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.ChangePasswordDTO;
import com.bluebus.booking.dto.LoginRequestDTO;
import com.bluebus.booking.dto.LoginResponseDTO;
import com.bluebus.booking.dto.UserDTO;
import com.bluebus.booking.dto.UserRegistrationDTO;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
	private AuthService authService;

	// ✅ LOGIN
	@PostMapping("/login")
	public ApiResponse<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {

		String token = authService.login(request.getEmail(), request.getPassword());

		LoginResponseDTO response = new LoginResponseDTO(token);

		return new ApiResponse<>(true, "Login successful", response);
	}

	// ✅ REGISTER
	@PostMapping("/register")
	public ApiResponse<UserDTO> register(@RequestBody UserRegistrationDTO registrationDTO) {

		Set<Role> userRoles = registrationDTO.getRoles();
		if (userRoles == null || userRoles.isEmpty()) {
			userRoles = new HashSet<>(Set.of(Role.USER));
		}

		User user = User.builder().name(registrationDTO.getName()).email(registrationDTO.getEmail())
				.password(registrationDTO.getPassword()).phone(registrationDTO.getPhone())
				.image(registrationDTO.getImage()).roles(new HashSet<>(userRoles))
				.busOperatorId(registrationDTO.getBusOperatorId())
				.build();

		User savedUser = authService.registerUser(user);

		UserDTO userDTO = mapToDTO(savedUser);

		return new ApiResponse<>(true, "User registered successfully", userDTO);
	}

	// ✅ CHANGE PASSWORD
	@PutMapping("/change-password")
	public ApiResponse<String> changePassword(@RequestBody ChangePasswordDTO pass) {

		authService.changePassword(pass.getEmail(), pass.getOldPassword(), pass.getNewPassword());

		return new ApiResponse<>(true, "Password changed successfully", null);
	}

	// ✅ GET USER BY EMAIL
	@GetMapping("/user-email/{email}")
	public ApiResponse<UserDTO> getUserByEmail(@PathVariable String email) {

		User user = authService.getUserByEmail(email);

		UserDTO userDTO = mapToDTO(user);

		return new ApiResponse<>(true, "User fetched successfully", userDTO);
	}

	@PostMapping("/logout")
	public ApiResponse<String> logout(@RequestHeader("Authorization") String authHeader) {

		String token = authHeader.substring(7);

		authService.logout(token);

		return new ApiResponse<>(true, "Logout successful", null);
	}

	// 🔁 MAPPER
	private UserDTO mapToDTO(User user) {
		return UserDTO.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).phone(user.getPhone())
				.image(user.getImage()).roles(user.getRoles()).isActive(user.getIsActive())
				.busOperatorId(user.getBusOperatorId())
				.build();
	}
}