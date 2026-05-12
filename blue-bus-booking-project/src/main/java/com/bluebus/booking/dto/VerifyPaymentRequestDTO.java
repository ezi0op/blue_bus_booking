package com.bluebus.booking.dto;

import com.bluebus.booking.dto.enums.PaymentMethod;

import lombok.Data;

@Data
public class VerifyPaymentRequestDTO {

	private String razorpayOrderId;

	private String razorpayPaymentId;

	private String razorpaySignature;

	private PaymentMethod paymentMethod;
}