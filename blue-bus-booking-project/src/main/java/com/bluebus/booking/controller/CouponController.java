package com.bluebus.booking.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.ApplyCouponRequestDTO;
import com.bluebus.booking.dto.ApplyCouponResponseDTO;
import com.bluebus.booking.service.CouponService;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

	@Autowired
	private CouponService couponService;

	// Apply coupon
	@PostMapping("/apply")
	public ApiResponse<ApplyCouponResponseDTO> applyCoupon(@RequestBody ApplyCouponRequestDTO request) {

		BigDecimal finalAmount = couponService.applyCoupon(request.getCouponCode(), request.getBookingAmount());

		BigDecimal discountApplied = request.getBookingAmount().subtract(finalAmount);

		ApplyCouponResponseDTO response = ApplyCouponResponseDTO.builder().originalAmount(request.getBookingAmount())
				.finalAmount(finalAmount).discountApplied(discountApplied).message("Coupon applied successfully")
				.build();

		return new ApiResponse<>(true, "Coupon applied successfully", response);
	}
}