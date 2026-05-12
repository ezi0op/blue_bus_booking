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

@Service
public class BusOperatorServiceImpl implements BusOperatorService {

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private BusOperatorRepository busOperatorRepository;

	@Override
	public BusOperator createOperator(BusOperator operator) {
		return busOperatorRepository.save(operator);
	}

	@Override
	public BusOperator getOperatorById(Long id) {

		return busOperatorRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("BusOperator not found with id: " + id));
	}

	@Override
	public List<BusOperator> getAllOperators() {

		return busOperatorRepository.findAll();
	}

	@Transactional
	@Override
	public BusOperator updateOperator(Long id, BusOperator updatedOperator) {

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

		return busOperatorRepository.save(existing);
	}

	@Transactional
	@Override
	public BusOperator deactivateOperator(Long id) {
		BusOperator operator = getOperatorById(id);

		if (!operator.getIsActive()) {
			throw new RuntimeException("Operator already inactive");
		}
		operator.setIsActive(false);

		return busOperatorRepository.save(operator);
	}

	@Override
	public List<BusOperator> searchOperators(String name) {
		return busOperatorRepository.findByNameContainingIgnoreCase(name);
	}

	@Override
	public List<Route> getRoutes(Long busId) {
		return routeRepository.findByDistinctRouteByBusId(busId);
	}
	
	
	
	
	
	
	
	
	

}
