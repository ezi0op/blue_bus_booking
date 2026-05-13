package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.entity.BusOperator;
import com.bluebus.booking.repository.BusOperatorRepository;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.service.BusService;

@Service
public class BusServiceImpl implements BusService {

	@Autowired
	private BusRepository busRepository;

	@Autowired
	private BusOperatorRepository busOperatorRepository;

	@Override
	public Bus createBus(Bus bus) {

		if (bus.getOperator() == null || bus.getOperator().getId() == null) {
			throw new RuntimeException("Operator is required");
		}
		BusOperator operator = busOperatorRepository.findById(bus.getOperator().getId())
				.orElseThrow(() -> new RuntimeException("Operator not found"));

		bus.setOperator(operator);

		return busRepository.save(bus);
	}

	@Override
	public Bus getBusById(Long id) {

		return busRepository.findById(id).orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
	}

	@Override
	public List<Bus> getAllBuses() {

		return busRepository.findAll();
	}

	@Override
	public List<Bus> getBusesByOperator(Long operatorId) {

		return busRepository.findByOperatorId(operatorId);
	}

	@Transactional
	@Override
	public Bus updateBus(Long id, Bus updatedBus) {
		Bus existing = getBusById(id);

		if (updatedBus.getBusNumber() != null) {
			existing.setBusNumber(updatedBus.getBusNumber());
		}

		if (updatedBus.getBusType() != null) {
			existing.setBusType(updatedBus.getBusType());
		}

		if (updatedBus.getTotalSeats() != null) {
			existing.setTotalSeats(updatedBus.getTotalSeats());
		}

		if (updatedBus.getOperator() != null && updatedBus.getOperator().getId() != null) {

			BusOperator operator = busOperatorRepository.findById(updatedBus.getOperator().getId())
					.orElseThrow(() -> new RuntimeException("Operator not found"));

			existing.setOperator(operator);
		}

		return busRepository.save(existing);
	}

	@Transactional
	@Override
	public Bus deactivateBus(Long id) {
		Bus bus = getBusById(id);

		// Toggle status instead of just deactivating
		bus.setIsActive(!bus.getIsActive());

		return busRepository.save(bus);
	}

}
