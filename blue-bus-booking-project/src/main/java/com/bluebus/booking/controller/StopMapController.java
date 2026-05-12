package com.bluebus.booking.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.StopMapDTO;
import com.bluebus.booking.service.StopMapService;

@RestController
@RequestMapping("/api/maps")
public class StopMapController {

	@Autowired
	private StopMapService stopMapService;

	@GetMapping("/routes/{routeId}/stops")
	public ApiResponse<List<StopMapDTO>> getStopsByRoute(@PathVariable Long routeId) {

		List<StopMapDTO> stops = stopMapService.getStopsByRoute(routeId);

		return new ApiResponse<>(true, "Stops fetched successfully", stops);
	}
}