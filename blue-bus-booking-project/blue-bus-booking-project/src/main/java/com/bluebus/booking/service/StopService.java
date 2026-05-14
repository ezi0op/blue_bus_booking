package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.Stop;

public interface StopService {
	Stop addStop(Stop stop);

	List<Stop> getStopsByRoute(Long routeId);

	Stop updateStop(Long id, Stop stop);

	

	Stop deactivateStop(Long id);
}
