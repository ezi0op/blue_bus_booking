package com.bluebus.booking.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank
	@Column(nullable = false, unique = true, length = 50)
	private String couponCode;

	@NotBlank
	@Column(nullable = false, length = 200)
	private String description;

	@NotNull
	@DecimalMin("0.0")
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal discountAmount;

	@NotNull
	@PositiveOrZero
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal minimumBookingAmount;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

	@NotNull
	@Column(nullable = false)
	private LocalDateTime expiryDate;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
}