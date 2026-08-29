package com.bluebus.booking.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.entity.Route;
import com.bluebus.booking.repository.RouteRepository;
import com.bluebus.booking.service.RouteService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RouteServiceImpl implements RouteService {

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private com.bluebus.booking.repository.TripRepository tripRepository;

	@Override
	public Route createRoute(Route route) {
		log.info("createRoute called with route: {}", route);
		try {
			return routeRepository.save(route);
		} catch (Exception e) {
			log.error("Error in createRoute with route: {}", route, e);
			throw e;
		}
	}

	@Override
	public Route getRouteById(Long id) {
		log.info("getRouteById called with id: {}", id);
		try {
			return routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found with id: " + id));
		} catch (Exception e) {
			log.error("Error in getRouteById with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<Route> searchRoutes(String source, String destination) {
		log.info("searchRoutes called with source: {}, destination: {}", source, destination);
		try {
			source = (source == null) ? "" : source.trim().toUpperCase();
			destination = (destination == null) ? "" : destination.trim().toUpperCase();

			return routeRepository.findBySourceContainingIgnoreCaseAndDestinationContainingIgnoreCase(source, destination);
		} catch (Exception e) {
			log.error("Error in searchRoutes with source: {}, destination: {}", source, destination, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Route updateRoute(Long id, Route updatedRoute) {
		log.info("updateRoute called with id: {}, updatedRoute: {}", id, updatedRoute);
		try {
			Route existing = getRouteById(id);

			if (updatedRoute.getSource() != null) {
				existing.setSource(updatedRoute.getSource());
			}

			if (updatedRoute.getDestination() != null) {
				existing.setDestination(updatedRoute.getDestination());
			}

			if (updatedRoute.getDistance() != null && updatedRoute.getDistance() > 0) {
				existing.setDistance(updatedRoute.getDistance());
			}

			if (updatedRoute.getDuration() != null) {
				existing.setDuration(updatedRoute.getDuration());
			}

			if (updatedRoute.getImage() != null) {
				existing.setImage(updatedRoute.getImage());
			}

			return routeRepository.save(existing);
		} catch (Exception e) {
			log.error("Error in updateRoute with id: {}, updatedRoute: {}", id, updatedRoute, e);
			throw e;
		}
	}

	@Transactional
	@Override
	public Route deactivateRoute(Long id) {
		log.info("deactivateRoute called with id: {}", id);
		try {
			Route route = getRouteById(id);

			// Toggle status instead of just deactivating
			route.setIsActive(!route.getIsActive());

			return routeRepository.save(route);	
		} catch (Exception e) {
			log.error("Error in deactivateRoute with id: {}", id, e);
			throw e;
		}
	}

	@Override
	public List<Route> getActiveRoutes() {
		log.info("getActiveRoutes called");
		try {
			return routeRepository.findByIsActiveTrue();
		} catch (Exception e) {
			log.error("Error in getActiveRoutes", e);
			throw e;
		}
	}

	@Override
	public Page<Route> getAllRoutes(int page, int size, String sortBy, String direction) {
		log.info("getAllRoutes called with page: {}, size: {}, sortBy: {}, direction: {}", page, size, sortBy, direction);
		try {
			Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

			Pageable pageable = PageRequest.of(page, size, sort);

			return routeRepository.findAll(pageable);
		} catch (Exception e) {
			log.error("Error in getAllRoutes with page: {}, size: {}, sortBy: {}, direction: {}", page, size, sortBy, direction, e);
			throw e;
		}
	}

	@Override
	public java.time.LocalDate getNextTripDate(Long routeId) {
		log.info("getNextTripDate called with routeId: {}", routeId);
		try {
			return tripRepository.findNextTripDate(routeId, java.time.LocalDate.now());
		} catch (Exception e) {
			log.error("Error in getNextTripDate with routeId: {}", routeId, e);
			throw e;
		}
	}

}
