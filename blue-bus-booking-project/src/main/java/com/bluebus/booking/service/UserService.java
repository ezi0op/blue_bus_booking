package com.bluebus.booking.service;

import java.util.List;

import java.util.Set;

import com.bluebus.booking.dto.enums.Role;
import com.bluebus.booking.entity.User;

public interface UserService {

	User getUserById(Long userId);

	User updateUser(Long userId, User user);

	List<User> getAllUsers();

	User updateUserStatus(Long userId, boolean active);

	User updateUserRoles(Long userId, Set<Role> roles);

	boolean deleteUser(Long userId);

	long getUserCount();

}


