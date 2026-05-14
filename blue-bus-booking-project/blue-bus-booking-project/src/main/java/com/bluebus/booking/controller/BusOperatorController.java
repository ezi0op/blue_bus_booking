package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BusOperatorDTO;
import com.bluebus.booking.dto.RouteDTO;
import com.bluebus.booking.entity.BusOperator;
import com.bluebus.booking.entity.Route;
import com.bluebus.booking.service.BusOperatorService;

@RestController
@RequestMapping("/api/operators")
public class BusOperatorController {

	@Autowired
	private BusOperatorService busOperatorService;

	@GetMapping
	public ApiResponse<List<BusOperatorDTO>> getAllOperators() {
		List<BusOperator> operators = busOperatorService.getAllOperators();
		List<BusOperatorDTO> response = new ArrayList<>();
		for (BusOperator op : operators) {
			response.add(mapToDTO(op));
		}

		return new ApiResponse<>(true, "Operators fetched", response);
	}

	@GetMapping("/{id}")
	public ApiResponse<BusOperatorDTO> getOperator(@PathVariable Long id) {
		BusOperator operator = busOperatorService.getOperatorById(id);
		return new ApiResponse<>(true, "Operator fetched", mapToDTO(operator));
	}

	@GetMapping("/search/{name}")
	public ApiResponse<List<BusOperatorDTO>> search(@PathVariable String name) {

		List<BusOperator> operators = busOperatorService.searchOperators(name);
		List<BusOperatorDTO> response = new ArrayList<>();

		for (BusOperator op : operators) {
			response.add(mapToDTO(op));
		}

		return new ApiResponse<>(true, "Search results", response);
	}

	// ✅ GET ROUTES BY BUS ID
	@GetMapping("/bus/{busId}/routes")
	public ApiResponse<List<RouteDTO>> getRoutesByBus(@PathVariable Long busId) {

		List<Route> routes = busOperatorService.getRoutes(busId);

		List<RouteDTO> response = new ArrayList<>();

		for (Route route : routes) {
			response.add(mapRouteToDTO(route));
		}

		return new ApiResponse<>(true, "Routes fetched successfully", response);
	}

	// 🔁 MAPPER
	private BusOperatorDTO mapToDTO(BusOperator op) {
		return BusOperatorDTO.builder().id(op.getId()).name(op.getName()).contactEmail(op.getContactEmail())
				.contactPhone(op.getContactPhone()).licenseNumber(op.getLicenseNumber()).rating(op.getRating())
				.isActive(op.getIsActive()).image(op.getImage()).build();
	}

	// 🔁 ROUTE MAPPER
	private RouteDTO mapRouteToDTO(Route route) {

		return RouteDTO.builder().id(route.getId()).source(route.getSource()).destination(route.getDestination())
				.distance(route.getDistance()).duration(route.getDuration()).image(route.getImage())
				.isActive(route.getIsActive()).build();
	}

}
