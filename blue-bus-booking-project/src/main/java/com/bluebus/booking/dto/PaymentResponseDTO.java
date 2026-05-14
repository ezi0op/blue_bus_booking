package com.bluebus.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bluebus.booking.dto.enums.PaymentMethod;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponseDTO {

	private Long bookingId;

	private String razorpayOrderId;
	private String razorpayPaymentId;

	private BigDecimal amount;
	private BigDecimal refundedAmount;

	private String currency;

	private String paymentStatus;
	private PaymentMethod paymentMethod;
	private String refundReason;
	private LocalDateTime paidAt;

	private String message;
}