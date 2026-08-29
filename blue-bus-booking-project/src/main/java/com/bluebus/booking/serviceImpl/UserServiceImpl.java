package com.bluebus.booking.serviceImpl;

import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.enums.Role;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserServiceImpl implements UserService {


	@Autowired
	private UserRepository userRepository;

	@Override
	public User getUserById(Long userId) {
		log.info("getUserById called with userId: {}", userId);
		try {
			return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
		} catch (Exception e) {
			log.error("Error in getUserById with userId: {}", userId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public User updateUser(Long userId, User updatedUser) {
		log.info("updateUser called with userId: {}, updatedUser: {}", userId, updatedUser);
		try {
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
		} catch (Exception e) {
			log.error("Error in updateUser with userId: {}, updatedUser: {}", userId, updatedUser, e);
			throw e;
		}
	}

	@Override
	public List<User> getAllUsers() {
		log.info("getAllUsers called");
		try {
			return userRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllUsers", e);
			throw e;
		}
	}

	@Transactional
	@Override
	public User updateUserStatus(Long userId, boolean active) {
		log.info("updateUserStatus called with userId: {}, active: {}", userId, active);
		try {
			User user = getUserById(userId);

			user.setIsActive(active);

			return userRepository.save(user);
		} catch (Exception e) {
			log.error("Error in updateUserStatus with userId: {}, active: {}", userId, active, e);
			throw e;
		}

	}

	@Transactional
	@Override
	public User updateUserRoles(Long userId, Set<Role> roles) {
		log.info("updateUserRoles called with userId: {}, roles: {}", userId, roles);
		try {
			User user = getUserById(userId);
			user.getRoles().clear();
			if (roles != null) {
				user.getRoles().addAll(roles);
			}
			return userRepository.save(user);
		} catch (Exception e) {
			log.error("Error in updateUserRoles with userId: {}, roles: {}", userId, roles, e);
			throw e;
		}
	}

	@Override
	public boolean deleteUser(Long id) {
		log.info("deleteUser called with id: {}", id);
		try {
			User user = userRepository.findById(id).orElse(null);

			if (user == null)
				return false;

			user.setIsActive(false); //✅ SOFT DELETE 
			userRepository.save(user);

			return true;
		} catch (Exception e) {
			log.error("Error in deleteUser with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public long getUserCount() {
		log.info("getUserCount called");
		try {
			return userRepository.count();
		} catch (Exception e) {
			log.error("Error in getUserCount", e);
			throw e;
		}
	}

}

