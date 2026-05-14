package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.BusOperatorDTO;
import com.bluebus.booking.entity.BusOperator;
import com.bluebus.booking.service.BusOperatorService;

@RestController
@RequestMapping("/api/admin/operators")
public class AdminBusOperatorController {

	@Autowired
	private BusOperatorService busOperatorService;

	// Bus operator Controlles for admin

	@PostMapping
	public ApiResponse<BusOperatorDTO> create(@RequestBody BusOperator operator) {
		BusOperator saved = busOperatorService.createOperator(operator);

		return new ApiResponse<>(true, "Created", mapToDTO(saved));
	}

	@PutMapping("/{id}")
	public ApiResponse<BusOperatorDTO> update(@PathVariable Long id, @RequestBody BusOperator operator) {

		BusOperator updated = busOperatorService.updateOperator(id, operator);

		return new ApiResponse<>(true, "Updated", mapToDTO(updated));
	}

	@PutMapping("/{id}/deactivate")
	public ApiResponse<BusOperatorDTO> deactivate(@PathVariable Long id) {

		BusOperator operator = busOperatorService.deactivateOperator(id);

		return new ApiResponse<>(true, "Deactivated", mapToDTO(operator));
	}

	// 🔁 Admin BusOperator MAPPER
	private BusOperatorDTO mapToDTO(BusOperator op) {
		return BusOperatorDTO.builder().id(op.getId()).name(op.getName()).contactEmail(op.getContactEmail())
				.contactPhone(op.getContactPhone()).licenseNumber(op.getLicenseNumber()).rating(op.getRating())
				.image(op.getImage()).isActive(op.getIsActive()).build();
	}
}
