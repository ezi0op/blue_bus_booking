package com.bluebus.booking.controller.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.StopDTO;
import com.bluebus.booking.entity.Stop;
import com.bluebus.booking.service.StopService;

@RestController
@RequestMapping("/api/admin/stops")
public class AdminStopController {

	@Autowired
	private StopService stopService;

	@PostMapping
	public ApiResponse<StopDTO> create(@RequestBody Stop stop) {
		Stop saved = stopService.addStop(stop);

		return new ApiResponse<>(true, "Stop created", mapToDTO(saved));
	}

	@PutMapping("/{id}")
	public ApiResponse<StopDTO> update(@PathVariable Long id, @RequestBody Stop stop) {
		Stop updated = stopService.updateStop(id, stop);
		return new ApiResponse<>(true, "Stop updated", mapToDTO(updated));
	}

	@PutMapping("/{id}/deactivate")
	public ApiResponse<StopDTO> deactivate(@PathVariable Long id) {

		Stop stop = stopService.deactivateStop(id);

		return new ApiResponse<>(true, "Stop deactivated", mapToDTO(stop));

	}

	// 🔁 MAPPER
	private StopDTO mapToDTO(Stop stop) {
		return StopDTO.builder().id(stop.getId()).name(stop.getName()).latitude(stop.getLatitude())
				.longitude(stop.getLongitude()).sequenceOrder(stop.getSequenceOrder()).routeId(stop.getRoute().getId())
				.arrivalTime(stop.getArrivalTime()).departureTime(stop.getDepartureTime())
				.isActive(stop.getIsActive()).build();
	}
}