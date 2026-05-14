package com.bluebus.booking.service;

import com.bluebus.booking.dto.CreatePaymentRequestDTO;
import com.bluebus.booking.dto.PaymentResponseDTO;
import com.bluebus.booking.dto.VerifyPaymentRequestDTO;
import com.bluebus.booking.dto.enums.PaymentMethod;

public interface PaymentService {

	// Create Razorpay order
	PaymentResponseDTO createOrder(CreatePaymentRequestDTO request);

	// Verify successful payment
	void verifyPayment(VerifyPaymentRequestDTO request);

	// Mark payment failed
	void markPaymentFailed(VerifyPaymentRequestDTO request);

	// Get payment details using bookingId
	PaymentResponseDTO getPaymentByBookingId(Long bookingId);

	// Process auto refund
	PaymentResponseDTO processRefund(Long bookingId, String reason, boolean isFullRefund);

	// Process offline payment (Cash, Unknown)
	public void processOfflinePayment(CreatePaymentRequestDTO request, PaymentMethod paymentMethod);
}