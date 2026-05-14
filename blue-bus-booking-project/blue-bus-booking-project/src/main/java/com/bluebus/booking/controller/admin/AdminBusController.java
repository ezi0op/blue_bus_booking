package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BusDTO;
import com.bluebus.booking.entity.Bus;
import com.bluebus.booking.service.BusService;

@RestController
@RequestMapping("/api/admin/buses")
public class AdminBusController {

	@Autowired
	private BusService busService;

	// ➕ CREATE
	@PostMapping
	public ApiResponse<BusDTO> create(@RequestBody Bus bus) {

		Bus saved = busService.createBus(bus);

		return new ApiResponse<>(true, "Bus created", mapToDTO(saved));
	}

	// ✏️ UPDATE
	@PutMapping("/{id}")
	public ApiResponse<BusDTO> update(@PathVariable Long id, @RequestBody Bus bus) {

		Bus updated = busService.updateBus(id, bus);

		return new ApiResponse<>(true, "Bus updated", mapToDTO(updated));
	}

	// ❌ DEACTIVATE
	@PutMapping("/{id}/deactivate")
	public ApiResponse<BusDTO> deactivate(@PathVariable Long id) {

		Bus bus = busService.deactivateBus(id);

		return new ApiResponse<>(true, "Bus deactivated", mapToDTO(bus));
	}

	// 🔁 MAPPER
	private BusDTO mapToDTO(Bus bus) {
		return BusDTO.builder().id(bus.getId()).busNumber(bus.getBusNumber()).busType(bus.getBusType())
				.totalSeats(bus.getTotalSeats()).operatorId(bus.getOperator().getId())
				.operatorName(bus.getOperator().getName()).image(bus.getImage()).isActive(bus.getIsActive()).build();
	}
}