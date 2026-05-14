package com.bluebus.booking.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.StopDTO;
import com.bluebus.booking.entity.Stop;
import com.bluebus.booking.service.StopService;

@RestController
@RequestMapping("/api/stops")
public class StopController {

	@Autowired
	private StopService stopService;

	@GetMapping("/route/{routeId}")
	public ApiResponse<List<StopDTO>> getStopsByRoute(@PathVariable Long routeId) {
		List<Stop> stops = stopService.getStopsByRoute(routeId);
		List<StopDTO> response = new ArrayList<>();

		for (Stop s : stops) {
			response.add(mapToDTO(s));
		}
		return new ApiResponse<>(true, "Stops fetched", response);

	}

	// 🔁 MAPPER
	private StopDTO mapToDTO(Stop stop) {
		return StopDTO.builder().id(stop.getId()).name(stop.getName()).latitude(stop.getLatitude())
				.longitude(stop.getLongitude()).sequenceOrder(stop.getSequenceOrder()).routeId(stop.getRoute().getId())
				.arrivalTime(stop.getArrivalTime()).departureTime(stop.getDepartureTime())
				.isActive(stop.getIsActive()).build();
	}

}
