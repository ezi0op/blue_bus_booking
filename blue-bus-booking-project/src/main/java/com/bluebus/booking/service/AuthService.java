package com.bluebus.booking.service;

import com.bluebus.booking.entity.User;

public interface AuthService {

	String login(String email, String password);

	void logout(String token);

	boolean changePassword(String email, String oldPassword, String newPassword);

	User registerUser(User user);

	User getUserByEmail(String email);

	User getByEmail(String email);

	void resendVerificationEmail(String email);
}
