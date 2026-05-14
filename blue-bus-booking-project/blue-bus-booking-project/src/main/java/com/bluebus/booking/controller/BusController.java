package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BusDTO;
import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.service.BusService;

@RestController
@RequestMapping("/api/buses")
public class BusController {

	@Autowired
	private BusService busService;

	@GetMapping
	public ApiResponse<List<BusDTO>> getAllBuses() {
		List<Bus> buses = busService.getAllBuses();

		List<BusDTO> response = new ArrayList<>();

		for (Bus bus : buses) {
			response.add(mapToDTO(bus));
		}

		return new ApiResponse<>(true, "Buses fetched", response);
	}

	@GetMapping("/{id}")
	public ApiResponse<BusDTO> getBus(@PathVariable Long id) {

		Bus bus = busService.getBusById(id);

		return new ApiResponse<>(true, "Bus fetched", mapToDTO(bus));
	}

	@GetMapping("/operator/{operatorId}")
	public ApiResponse<List<BusDTO>> getByOperator(@PathVariable Long operatorId) {

		List<Bus> buses = busService.getBusesByOperator(operatorId);

		List<BusDTO> response = new ArrayList<>();

		for (Bus b : buses) {
			response.add(mapToDTO(b));
		}

		return new ApiResponse<>(true, "Buses fetched", response);
	}

	// 🔁 MAPPER
	private BusDTO mapToDTO(Bus bus) {
		return BusDTO.builder().id(bus.getId()).busNumber(bus.getBusNumber()).busType(bus.getBusType())
				.totalSeats(bus.getTotalSeats()).operatorId(bus.getOperator().getId())
				.operatorName(bus.getOperator().getName()).isActive(bus.getIsActive()).build();
	}

}
