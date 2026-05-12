package com.bluebus.booking.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.CreatePaymentRequestDTO;
import com.bluebus.booking.dto.PaymentResponseDTO;
import com.bluebus.booking.dto.VerifyPaymentRequestDTO;
import com.bluebus.booking.dto.enums.PaymentMethod;
import com.bluebus.booking.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

	@Autowired
	private PaymentService paymentService;

	@Value("${razorpay.key.id}")
	private String razorpayKeyId;

	/*
	 * Send Razorpay Key ID to frontend
	 */
	@GetMapping("/config")
	@ResponseBody
	public ApiResponse<Map<String, Object>> getConfig() {

		Map<String, Object> response = Map.of("keyId", razorpayKeyId.trim());

		return new ApiResponse<>(true, "Config fetched successfully", response);
	}

	/*
	 * Create demo Razorpay order
	 */
	@PostMapping("/create-order")
	public ApiResponse<PaymentResponseDTO> createOrder(@RequestBody CreatePaymentRequestDTO request) {

		PaymentResponseDTO response = paymentService.createOrder(request);

		return new ApiResponse<>(true, "Razorpay order created successfully", response);
	}

	/*
	 * Verify payment after success Auto updates: Payment -> SUCCESS Booking ->
	 * CONFIRMED
	 */
	@PostMapping("/verify")
	public ApiResponse<String> verifyPayment(@RequestBody VerifyPaymentRequestDTO request) {

		paymentService.verifyPayment(request);

		return new ApiResponse<>(true, "Payment verified successfully", "SUCCESS");
	}

	/*
	 * Mark payment as failed Auto updates: Payment -> FAILED Booking -> CANCELLED
	 */
	@PostMapping("/failed")
	public ApiResponse<String> markPaymentFailed(@RequestBody VerifyPaymentRequestDTO request) {

		paymentService.markPaymentFailed(request);

		return new ApiResponse<>(true, "Payment marked as failed", "FAILED");
	}

	// Get payment details by booking ID
	@GetMapping("/{bookingId}")
	public ApiResponse<PaymentResponseDTO> getPayment(@PathVariable Long bookingId) {
		return new ApiResponse<>(true, "Payment fetched successfully", paymentService.getPaymentByBookingId(bookingId));
	}

	// Process refund — called when user cancels booking
	@PostMapping("/refund/{bookingId}")
	public ApiResponse<PaymentResponseDTO> processRefund(@PathVariable Long bookingId,
			@RequestParam(defaultValue = "Cancelled by user") String reason) {
		return new ApiResponse<>(true, "Refund processed successfully",
				paymentService.processRefund(bookingId, reason));
	}

	@PostMapping("/offline")
	public ApiResponse<String> processOfflinePayment(@RequestBody CreatePaymentRequestDTO request, @RequestParam PaymentMethod paymentMethod) {
		paymentService.processOfflinePayment(request, paymentMethod);
		return new ApiResponse<>(true, "Offline payment processed successfully", "SUCCESS");
	}

}