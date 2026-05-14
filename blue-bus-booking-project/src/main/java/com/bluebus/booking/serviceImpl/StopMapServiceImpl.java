package com.bluebus.booking.serviceImpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.StopMapDTO;
import com.bluebus.booking.entity.Stop;
import com.bluebus.booking.repository.StopRepository;
import com.bluebus.booking.service.StopMapService;

@Service
public class StopMapServiceImpl implements StopMapService {

	@Autowired
	private StopRepository stopRepository;

	@Override
	public List<StopMapDTO> getStopsByRoute(Long routeId) {

		List<Stop> stops = stopRepository.findByRouteIdOrderBySequenceOrderAsc(routeId);

		List<StopMapDTO> response = new ArrayList<>();

		for (Stop stop : stops) {
			response.add(mapToDTO(stop));
		}

		return response;
	}

	private StopMapDTO mapToDTO(Stop stop) {
		return StopMapDTO.builder().id(stop.getId()).name(stop.getName()).latitude(stop.getLatitude())
				.longitude(stop.getLongitude()).sequenceOrder(stop.getSequenceOrder())
				.arrivalTime(stop.getArrivalTime() != null ? stop.getArrivalTime().toString() : null)
				.departureTime(stop.getDepartureTime() != null ? stop.getDepartureTime().toString() : null)
				.routeId(stop.getRoute().getId()).build();
	}
}