package com.bluebus.booking.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.ApplyCouponRequestDTO;
import com.bluebus.booking.dto.ApplyCouponResponseDTO;
import com.bluebus.booking.dto.CouponResponseDTO;
import com.bluebus.booking.entity.Coupon;
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

	// Get all active coupons for public display
	@GetMapping
	public ApiResponse<List<CouponResponseDTO>> getAllActiveCoupons() {

		List<CouponResponseDTO> response = couponService.getAllCoupons().stream()
				.filter(Coupon::getIsActive)
				.map(this::mapToResponseDTO)
				.collect(Collectors.toList());

		return new ApiResponse<>(true, "Active coupons fetched successfully", response);
	}

	private CouponResponseDTO mapToResponseDTO(Coupon coupon) {
		return CouponResponseDTO.builder()
				.id(coupon.getId())
				.couponCode(coupon.getCouponCode())
				.description(coupon.getDescription())
				.discountAmount(coupon.getDiscountAmount())
				.minimumBookingAmount(coupon.getMinimumBookingAmount())
				.isActive(coupon.getIsActive())
				.expiryDate(coupon.getExpiryDate())
				.build();
	}
}