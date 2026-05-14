package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.UserService;

@Service
public class UserServiceImpl implements UserService {

	@Autowired
	private UserRepository userRepository;

	@Override
	public User getUserById(Long userId) {
		return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
	}

	@Transactional
	@Override
	public User updateUser(Long userId, User updatedUser) {
		User existing = getUserById(userId);

		if (updatedUser.getName() != null) {
			existing.setName(updatedUser.getName());
		}

		if (updatedUser.getPhone() != null) {
			existing.setPhone(updatedUser.getPhone());
		}

		if (updatedUser.getImage() != null) {
			existing.setImage(updatedUser.getImage());
		}

		return userRepository.save(existing);
	}

	@Override
	public List<User> getAllUsers() {
		return userRepository.findAll();
	}

	@Transactional
	@Override
	public User updateUserStatus(Long userId, boolean active) {
		User user = getUserById(userId);

		user.setIsActive(active);

		return userRepository.save(user);

	}

	@Override
	public boolean deleteUser(Long id) {
		User user = userRepository.findById(id).orElse(null);

		if (user == null)
			return false;

		user.setIsActive(false); //✅ SOFT DELETE 
		userRepository.save(user);

		return true;
	}

	@Override
	public long getUserCount() {
		return userRepository.count();
	}

}
