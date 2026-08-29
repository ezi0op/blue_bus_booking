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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BusServiceImpl implements BusService {

	@Autowired
	private BusRepository busRepository;

	@Autowired
	private BusOperatorRepository busOperatorRepository;

	@Override
	public Bus createBus(Bus bus) {
		log.info("createBus called with bus: {}", bus);
		try {
			if (bus.getOperator() == null || bus.getOperator().getId() == null) {
				throw new RuntimeException("Operator is required");
			}
			BusOperator operator = busOperatorRepository.findById(bus.getOperator().getId())
					.orElseThrow(() -> new RuntimeException("Operator not found"));

			bus.setOperator(operator);

			return busRepository.save(bus);
		} catch (Exception e) {
			log.error("Error in createBus with bus: {}", bus, e);
			throw e;
		}
	}

	@Override
	public Bus getBusById(Long id) {
		log.info("getBusById called with id: {}", id);
		try {
			return busRepository.findById(id).orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
		} catch (Exception e) {
			log.error("Error in getBusById with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<Bus> getAllBuses() {
		log.info("getAllBuses called");
		try {
			return busRepository.findAll();
		} catch (Exception e) {
			log.error("Error in getAllBuses", e);
			throw e;
		}
	}

	@Override
	public List<Bus> getBusesByOperator(Long operatorId) {
		log.info("getBusesByOperator called with operatorId: {}", operatorId);
		try {
			return busRepository.findByOperatorId(operatorId);
		} catch (Exception e) {
			log.error("Error in getBusesByOperator with operatorId: {}", operatorId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Bus updateBus(Long id, Bus updatedBus) {
		log.info("updateBus called with id: {}, updatedBus: {}", id, updatedBus);
		try {
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

			if (updatedBus.getImage() != null) {
				existing.setImage(updatedBus.getImage());
			}

			return busRepository.save(existing);
		} catch (Exception e) {
			log.error("Error in updateBus with id: {}, updatedBus: {}", id, updatedBus, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Bus deactivateBus(Long id) {
		log.info("deactivateBus called with id: {}", id);
		try {
			Bus bus = getBusById(id);

			// Toggle status instead of just deactivating
			bus.setIsActive(!bus.getIsActive());

			return busRepository.save(bus);
		} catch (Exception e) {
			log.error("Error in deactivateBus with id: {}", id, e);
			throw e;
		}
	}

}
