package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.Bus;

public interface BusService {
	Bus createBus(Bus bus);

	Bus getBusById(Long id);

	List<Bus> getAllBuses();

	List<Bus> getBusesByOperator(Long operatorId);

	Bus updateBus(Long id, Bus bus);

	Bus deactivateBus(Long id);
}
