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

@Service
public class RouteServiceImpl implements RouteService {

	@Autowired
	private RouteRepository routeRepository;

	@Autowired
	private com.bluebus.booking.repository.TripRepository tripRepository;

	@Override
	public Route createRoute(Route route) {

		return routeRepository.save(route);
	}

	@Override
	public Route getRouteById(Long id) {

		return routeRepository.findById(id).orElseThrow(() -> new RuntimeException("Route not found with id: " + id));
	}

	@Override
	public List<Route> searchRoutes(String source, String destination) {
		source = (source == null) ? "" : source.trim().toUpperCase();
		destination = (destination == null) ? "" : destination.trim().toUpperCase();

		return routeRepository.findBySourceContainingIgnoreCaseAndDestinationContainingIgnoreCase(source, destination);
	}

	@Transactional
	@Override
	public Route updateRoute(Long id, Route updatedRoute) {

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
	}

	@Transactional
	@Override
	public Route deactivateRoute(Long id) {
		Route route = getRouteById(id);

		// Toggle status instead of just deactivating
		route.setIsActive(!route.getIsActive());

		return routeRepository.save(route);	
	}

	@Override
	public List<Route> getActiveRoutes() {

		return routeRepository.findByIsActiveTrue();
	}

	@Override
	public Page<Route> getAllRoutes(int page, int size, String sortBy, String direction) {
		Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

		Pageable pageable = PageRequest.of(page, size, sort);

		return routeRepository.findAll(pageable);
	}

	@Override
	public java.time.LocalDate getNextTripDate(Long routeId) {
		return tripRepository.findNextTripDate(routeId, java.time.LocalDate.now());
	}

}
