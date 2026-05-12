package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.RouteDTO;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.service.RouteService;

@RestController
@RequestMapping("/api/admin/routes")
public class AdminRouteController {

	@Autowired
	private RouteService routeService;

	@PostMapping
	public ApiResponse<RouteDTO> create(@RequestBody Route route) {

		Route saved = routeService.createRoute(route);

		return new ApiResponse<>(true, "Route created", mapToDTO(saved));
	}

	// ✏️ UPDATE
	@PutMapping("/{id}")
	public ApiResponse<RouteDTO> update(@PathVariable Long id, @RequestBody Route route) {

		Route updated = routeService.updateRoute(id, route);

		return new ApiResponse<>(true, "Route updated", mapToDTO(updated));
	}

	// ❌ DEACTIVATE
	@PutMapping("/{id}/deactivate")
	public ApiResponse<RouteDTO> deactivate(@PathVariable Long id) {

		Route route = routeService.deactivateRoute(id);

		return new ApiResponse<>(true, "Route deactivated", mapToDTO(route));
	}

	// 🔁 MAPPER
	private RouteDTO mapToDTO(Route route) {
		return RouteDTO.builder().id(route.getId()).source(route.getSource()).destination(route.getDestination())
				.distance(route.getDistance()).duration(route.getDuration()).isActive(route.getIsActive()).build();
	}

}