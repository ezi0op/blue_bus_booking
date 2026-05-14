package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.dto.StopMapDTO;

public interface StopMapService {

	List<StopMapDTO> getStopsByRoute(Long routeId);

}