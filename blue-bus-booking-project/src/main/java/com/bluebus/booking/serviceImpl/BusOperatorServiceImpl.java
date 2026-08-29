package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.BusOperator;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.repository.BusOperatorRepository;
import com.bluebus.booking.repository.RouteRepository;
import com.bluebus.booking.service.BusOperatorService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BusOperatorServiceImpl implements BusOperatorService {

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private BusOperatorRepository busOperatorRepository;

	@Override
	public BusOperator createOperator(BusOperator operator) {
		log.info("createOperator called with operator: {}", operator);
		try {
			return busOperatorRepository.save(operator);
		} catch (Exception e) {
			log.error("Error in createOperator with operator: {}", operator, e);
			throw e;
		}
	}

	@Override
	public BusOperator getOperatorById(Long id) {
		log.info("getOperatorById called with id: {}", id);
		try {
			return busOperatorRepository.findById(id)
					.orElseThrow(() -> new RuntimeException("BusOperator not found with id: " + id));
		} catch (Exception e) {
			log.error("Error in getOperatorById with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<BusOperator> getAllOperators() {
		log.info("getAllOperators called");
		try {
			return busOperatorRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllOperators", e);
			throw e;
		}
	}

	@Transactional
	@Override
	public BusOperator updateOperator(Long id, BusOperator updatedOperator) {
		log.info("updateOperator called with id: {}, updatedOperator: {}", id, updatedOperator);
		try {
			BusOperator existing = getOperatorById(id);

			if (updatedOperator.getName() != null) {
				existing.setName(updatedOperator.getName());
			}
			if (updatedOperator.getContactEmail() != null) {
				existing.setContactEmail(updatedOperator.getContactEmail());
			}
			if (updatedOperator.getContactPhone() != null) {
				existing.setContactPhone(updatedOperator.getContactPhone());
			}
			if (updatedOperator.getLicenseNumber() != null) {
				existing.setLicenseNumber(updatedOperator.getLicenseNumber());
			}
			if (updatedOperator.getRating() != null) {
				existing.setRating(updatedOperator.getRating());
			}
			if (updatedOperator.getImage() != null) {
				existing.setImage(updatedOperator.getImage());
			}

			return busOperatorRepository.save(existing);
		} catch (Exception e) {
			log.error("Error in updateOperator with id: {}, updatedOperator: {}", id, updatedOperator, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public BusOperator deactivateOperator(Long id) {
		log.info("deactivateOperator called with id: {}", id);
		try {
			BusOperator operator = getOperatorById(id);

			// Toggle status instead of just deactivating
			operator.setIsActive(!operator.getIsActive());

			return busOperatorRepository.save(operator);
		} catch (Exception e) {
			log.error("Error in deactivateOperator with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<BusOperator> searchOperators(String name) {
		log.info("searchOperators called with name: {}", name);
		try {
			return busOperatorRepository.findByNameContainingIgnoreCase(name);
		} catch (Exception e) {
			log.error("Error in searchOperators with name: {}", name, e);
			throw e;
		}
	}

	@Override
	public List<Route> getRoutes(Long busId) {
		log.info("getRoutes called with busId: {}", busId);
		try {
			return routeRepository.findByDistinctRouteByBusId(busId);
		} catch (Exception e) {
			log.error("Error in getRoutes with busId: {}", busId, e);
			throw e;
		}
	}

}
