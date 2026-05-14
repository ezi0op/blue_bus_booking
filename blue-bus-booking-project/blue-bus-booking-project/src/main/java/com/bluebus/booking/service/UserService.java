package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.User;

public interface UserService {

	User getUserById(Long userId);

	User updateUser(Long userId, User user);

	List<User> getAllUsers();

	User updateUserStatus(Long userId, boolean active);

	boolean deleteUser(Long userId);

	long getUserCount();

}
