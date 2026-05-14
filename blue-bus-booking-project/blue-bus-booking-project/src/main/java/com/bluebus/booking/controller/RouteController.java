package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.RouteDTO;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.service.RouteService;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

	@Autowired
	private RouteService routeService;

	@GetMapping
	public ApiResponse<List<RouteDTO>> getAllRoutes(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "100") int size, @RequestParam(defaultValue = "id") String sortBy,
			@RequestParam(defaultValue = "asc") String direction) {

		Page<Route> routePage = routeService.getAllRoutes(page, size, sortBy, direction);

		List<RouteDTO> response = new ArrayList<>();

		for (Route route : routePage.getContent()) {
			response.add(mapToDTO(route));
		}

		return new ApiResponse<>(true, "Routes fetched successfully", response);
	}

	// 🔍 GET BY ID
	@GetMapping("/{id}")
	public ApiResponse<RouteDTO> getRoute(@PathVariable Long id) {

		Route route = routeService.getRouteById(id);

		return new ApiResponse<>(true, "Route fetched", mapToDTO(route));
	}

	// 🔎 SEARCH
	@GetMapping("/search")
	public ApiResponse<List<RouteDTO>> search(@RequestParam(required = false) String source,
			@RequestParam(required = false) String destination) {

		List<Route> routes = routeService.searchRoutes(source, destination);

		List<RouteDTO> response = new ArrayList<>();

		for (Route r : routes) {
			response.add(mapToDTO(r));
		}

		return new ApiResponse<>(true, "Routes found", response);
	}	

	// 🔁 MAPPER
	private RouteDTO mapToDTO(Route route) {
		return RouteDTO.builder().id(route.getId()).source(route.getSource()).destination(route.getDestination())
				.distance(route.getDistance()).image(route.getImage()).duration(route.getDuration())
				.isActive(route.getIsActive()).nextDate(routeService.getNextTripDate(route.getId())).build();
	}

}
