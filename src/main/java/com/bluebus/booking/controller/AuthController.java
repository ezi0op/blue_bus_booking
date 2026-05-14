package com.bluebus.booking.controller;

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

		User user = User.builder().name(registrationDTO.getName()).email(registrationDTO.getEmail())
				.password(registrationDTO.getPassword()).phone(registrationDTO.getPhone())
				.image(registrationDTO.getImage()).role(registrationDTO.getRole()).build();

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

	@PostMapping("/forgot-password")
	public ApiResponse<String> forgotPassword(@RequestBody String email) {
		// handle email being passed as raw string or JSON
		String cleanEmail = email.replace("\"", "").trim();
		if (cleanEmail.contains(":")) {
			// Extract email from {"email":"..."}
			cleanEmail = cleanEmail.substring(cleanEmail.indexOf(":") + 1, cleanEmail.lastIndexOf("}")).replace("\"", "").trim();
		}
		
		authService.forgotPassword(cleanEmail);
		return new ApiResponse<>(true, "Password reset link sent to your email", null);
	}

	@PostMapping("/reset-password")
	public ApiResponse<String> resetPassword(@RequestBody java.util.Map<String, String> request) {
		String token = request.get("token");
		String newPassword = request.get("newPassword");
		
		authService.resetPassword(token, newPassword);
		return new ApiResponse<>(true, "Password has been reset successfully", null);
	}

	// 🔁 MAPPER
	private UserDTO mapToDTO(User user) {
		return UserDTO.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).phone(user.getPhone())
				.image(user.getImage()).role(user.getRole()).isActive(user.getIsActive()).build();
	}
}