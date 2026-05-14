package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Route;
import com.bluebus.booking.entity.Stop;
import com.bluebus.booking.repository.RouteRepository;
import com.bluebus.booking.repository.StopRepository;
import com.bluebus.booking.service.StopService;

@Service
public class StopServiceImpl implements StopService {

	@Autowired
	private StopRepository stopRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Transactional
	@Override
	public Stop addStop(Stop stop) {

		if (stop.getRoute() == null || stop.getRoute().getId() == null) {
			throw new RuntimeException("Route is required");
		}

		Route route = routeRepository.findById(stop.getRoute().getId())
				.orElseThrow(() -> new RuntimeException("Route not found"));

		if (stopRepository.existsByRouteIdAndSequenceOrder(route.getId(), stop.getSequenceOrder())) {
			throw new RuntimeException("Duplicate stop sequence order");
		}

		stop.setRoute(route);

		return stopRepository.save(stop);
	}

	@Override
	public List<Stop> getStopsByRoute(Long routeId) {
		return stopRepository.findByRouteIdAndIsActiveTrueOrderBySequenceOrderAsc(routeId);
	}

	@Transactional
	@Override
	public Stop updateStop(Long id, Stop updatedStop) {

		Stop existing = stopRepository.findById(id).orElseThrow(() -> new RuntimeException("Stop not found"));

		if (updatedStop.getName() != null) {
			existing.setName(updatedStop.getName());
		}

		if (updatedStop.getLatitude() != null) {
			existing.setLatitude(updatedStop.getLatitude());
		}

		if (updatedStop.getLongitude() != null) {
			existing.setLongitude(updatedStop.getLongitude());
		}

		if (updatedStop.getSequenceOrder() != null) {

			boolean exits = stopRepository.existsByRouteIdAndSequenceOrder(existing.getRoute().getId(),
					updatedStop.getSequenceOrder());

			if (exits && !existing.getSequenceOrder().equals(updatedStop.getSequenceOrder())) {
				throw new RuntimeException("Duplicate stop sequence order");
			}

			existing.setSequenceOrder(updatedStop.getSequenceOrder());
		}

		return stopRepository.save(existing);
	}

	@Transactional
	@Override
	public Stop deactivateStop(Long id) {

		Stop stop = stopRepository.findById(id).orElseThrow(() -> new RuntimeException("Stop not found"));

		if (!stop.getIsActive()) {
			throw new RuntimeException("Stop already inactive");
		}

		stop.setIsActive(false);

		return stopRepository.save(stop);
	}
}
