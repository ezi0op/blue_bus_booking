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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class StopServiceImpl implements StopService {

	@Autowired
	private StopRepository stopRepository;

	@Autowired
	private RouteRepository routeRepository;

	@Transactional
	@Override
	public Stop addStop(Stop stop) {
		log.info("addStop called with stop: {}", stop);
		try {
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
		} catch (Exception e) {
			log.error("Error in addStop with stop: {}", stop, e);
			throw e;
		}
	}

	@Override
	public List<Stop> getStopsByRoute(Long routeId) {
		log.info("getStopsByRoute called with routeId: {}", routeId);
		try {
			return stopRepository.findByRouteIdAndIsActiveTrueOrderBySequenceOrderAsc(routeId);
		} catch (Exception e) {
			log.error("Error in getStopsByRoute with routeId: {}", routeId, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Stop updateStop(Long id, Stop updatedStop) {
		log.info("updateStop called with id: {}, updatedStop: {}", id, updatedStop);
		try {
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
		} catch (Exception e) {
			log.error("Error in updateStop with id: {}, updatedStop: {}", id, updatedStop, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Stop deactivateStop(Long id) {
		log.info("deactivateStop called with id: {}", id);
		try {
			Stop stop = stopRepository.findById(id).orElseThrow(() -> new RuntimeException("Stop not found"));

			if (!stop.getIsActive()) {
				throw new RuntimeException("Stop already inactive");
			}

			stop.setIsActive(false);

			return stopRepository.save(stop);
		} catch (Exception e) {
			log.error("Error in deactivateStop with id: {}", id, e);
			throw e;
		}
	}
}
