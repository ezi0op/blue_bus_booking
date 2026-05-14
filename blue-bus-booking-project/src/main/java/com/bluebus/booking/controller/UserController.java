package com.bluebus.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.UserDTO;
import com.bluebus.booking.dto.UserUpdateDTO;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

	@Autowired
	private UserService userService;

	@GetMapping("/{userId}")
	public ApiResponse<UserDTO> getUser(@PathVariable Long userId) {
		User user = userService.getUserById(userId);

		return new ApiResponse<>(true, "User retrieved successfully", mapToDTO(user));
	}

	@PutMapping("/{id}")
	public ApiResponse<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO updatedUserDTO) {
		
		User updatedUser = User.builder().id(id).name(updatedUserDTO.getName()).email(updatedUserDTO.getEmail())
				.phone(updatedUserDTO.getPhone()).image(updatedUserDTO.getImage())
				.isActive(updatedUserDTO.getIsActive()).build();
		
		User user = userService.updateUser(id, updatedUser);

		return new ApiResponse<>(true, "User updated", mapToDTO(user));
	}

	// 🔁 MAPPER
	private UserDTO mapToDTO(User user) {
		return UserDTO.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).phone(user.getPhone())
				.image(user.getImage()).isActive(user.getIsActive()).role(user.getRole()).build();
	}

}
