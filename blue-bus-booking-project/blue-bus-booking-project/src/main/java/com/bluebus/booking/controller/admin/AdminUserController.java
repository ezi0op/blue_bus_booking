package com.bluebus.booking.controller.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.UserDTO;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

	@Autowired
	private UserService userService;

	@GetMapping("/")
	public ApiResponse<List<UserDTO>> getAllUsers() {
		List<User> users = userService.getAllUsers();
		List<UserDTO> response = new ArrayList<>();

		for (User u : users) {
			response.add(mapToDTO(u));
		}

		return new ApiResponse<>(true, "Users fetched", response);
	}

	@GetMapping("/{id}")
	public ApiResponse<UserDTO> getUser(@PathVariable Long id) {
		User user = userService.getUserById(id);

		return new ApiResponse<>(true, "User fetched", mapToDTO(user));
	}

	// ACTIVATE/DEACTIVATE USER
	@GetMapping("/{id}/status")
	public ApiResponse<UserDTO> updateStatus(@PathVariable Long id, @RequestParam boolean active) {
		User user = userService.updateUserStatus(id, active);

		return new ApiResponse<>(true, "User status updated", mapToDTO(user));
	}

	// Hard delete user
	@DeleteMapping("/{id}")
	public ApiResponse<Boolean> deleteUser(@PathVariable Long id) {
		boolean deleted = userService.deleteUser(id);
		if (!deleted) {
			return new ApiResponse<>(false, "User not found", false);
		}
		return new ApiResponse<>(true, "User deleted", true);
	}

	// Get total users count
	@GetMapping("/count")
	public ApiResponse<Long> getCount() {
		return new ApiResponse<>(true, "User count fetched", userService.getUserCount());
	}

	// mapper
	private UserDTO mapToDTO(User user) {
		return UserDTO.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).phone(user.getPhone())
				.image(user.getImage()).isActive(user.getIsActive()).build();
	}

}
