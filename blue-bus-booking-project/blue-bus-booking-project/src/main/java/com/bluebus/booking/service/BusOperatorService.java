package com.bluebus.booking.service;

import java.util.List;

import com.bluebus.booking.entity.BusOperator;
import com.bluebus.booking.entity.Route;

public interface BusOperatorService {
	BusOperator createOperator(BusOperator operator);

	BusOperator getOperatorById(Long id);

	List<BusOperator> getAllOperators();

	BusOperator updateOperator(Long id, BusOperator operator);

	BusOperator deactivateOperator(Long id);

	List<BusOperator> searchOperators(String name);

	List<Route> getRoutes(Long busId);

}
