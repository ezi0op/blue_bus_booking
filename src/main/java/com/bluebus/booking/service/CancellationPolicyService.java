package com.bluebus.booking.service;

import java.math.BigDecimal;

public interface CancellationPolicyService {

	BigDecimal calculateRefundAmount(Long bookingId);

}