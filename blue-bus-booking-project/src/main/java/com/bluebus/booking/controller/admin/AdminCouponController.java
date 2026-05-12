package com.bluebus.booking.controller.admin;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.bluebus.booking.dto.ApiResponse;
import com.bluebus.booking.dto.CouponRequestDTO;
import com.bluebus.booking.dto.CouponResponseDTO;
import com.bluebus.booking.entity.Coupon;
import com.bluebus.booking.service.CouponService;

@RestController
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

	@Autowired
	private CouponService couponService;

	// Create coupon
	@PostMapping
	public ApiResponse<CouponResponseDTO> createCoupon(@RequestBody CouponRequestDTO request) {

		Coupon coupon = mapToEntity(request);

		Coupon savedCoupon = couponService.createCoupon(coupon);

		return new ApiResponse<>(true, "Coupon created successfully",
				mapToResponseDTO(savedCoupon, "Coupon created successfully"));
	}

	// Update coupon
	@PutMapping("/{couponId}")
	public ApiResponse<CouponResponseDTO> updateCoupon(@PathVariable Long couponId,
			@RequestBody CouponRequestDTO request) {

		Coupon coupon = mapToEntity(request);

		Coupon updatedCoupon = couponService.updateCoupon(couponId, coupon);

		return new ApiResponse<>(true, "Coupon updated successfully",
				mapToResponseDTO(updatedCoupon, "Coupon updated successfully"));
	}

	// Delete coupon
	@DeleteMapping("/{couponId}")
	public ApiResponse<String> deleteCoupon(@PathVariable Long couponId) {

		couponService.deleteCoupon(couponId);

		return new ApiResponse<>(true, "Coupon deleted successfully", null);
	}

	// Get all coupons
	@GetMapping
	public ApiResponse<List<CouponResponseDTO>> getAllCoupons() {

		List<CouponResponseDTO> response = couponService.getAllCoupons().stream()
				.map(coupon -> mapToResponseDTO(coupon, "Coupon fetched successfully")).collect(Collectors.toList());

		return new ApiResponse<>(true, "Coupons fetched successfully", response);
	}

	private Coupon mapToEntity(CouponRequestDTO request) {
		return Coupon.builder().couponCode(request.getCouponCode()).description(request.getDescription())
				.discountAmount(request.getDiscountAmount()).minimumBookingAmount(request.getMinimumBookingAmount())
				.isActive(request.getIsActive()).expiryDate(request.getExpiryDate()).build();
	}

	private CouponResponseDTO mapToResponseDTO(Coupon coupon, String message) {

		return CouponResponseDTO.builder().id(coupon.getId()).couponCode(coupon.getCouponCode())
				.description(coupon.getDescription()).discountAmount(coupon.getDiscountAmount())
				.minimumBookingAmount(coupon.getMinimumBookingAmount()).isActive(coupon.getIsActive())
				.expiryDate(coupon.getExpiryDate()).message(message).build();
	}
}