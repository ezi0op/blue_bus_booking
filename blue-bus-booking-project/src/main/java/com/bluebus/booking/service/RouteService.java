package com.bluebus.booking.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.bluebus.booking.entity.Route;

public interface RouteService {
	Route createRoute(Route route);

	Route getRouteById(Long id);

	Page<Route> getAllRoutes(int page, int size, String sortBy, String direction);

	List<Route> searchRoutes(String source, String destination);

	Route updateRoute(Long id, Route route);

	Route deactivateRoute(Long id);

	List<Route> getActiveRoutes();
}
