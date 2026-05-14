package com.bluebus.booking.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.bluebus.booking.dto.enums.PaymentMethod;
import com.bluebus.booking.dto.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "payments", indexes = { @Index(name = "idx_payment_booking", columnList = "booking_id"),
		@Index(name = "idx_payment_user", columnList = "user_id"),
		@Index(name = "idx_payment_status", columnList = "status") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "razorpay_order_id", nullable = false, unique = true, length = 100)
	private String razorpayOrderId;

	@Column(name = "razorpay_payment_id", nullable = true, unique = true, length = 100)
	private String razorpayPaymentId;

	@Column(name = "razorpay_signature", length = 500)
	private String razorpaySignature;

	@NotNull(message = "Amount is required")
	@Positive(message = "Amount must be positive")
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@Column(name = "used_coupon_code", length = 50)
	private String usedCouponCode;

	@Column(name = "discount_applied", precision = 10, scale = 2)
	@Builder.Default
	private BigDecimal discountApplied = BigDecimal.ZERO;

	@Column(nullable = false, length = 10)
	@Builder.Default
	private String currency = "INR";

	@NotNull(message = "Payment status is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PaymentStatus status;

	@Enumerated(EnumType.STRING)
	@Column(name = "payment_method")
	private PaymentMethod paymentMethod;

	@Column(name = "paid_at")
	private LocalDateTime paidAt;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "booking_id", nullable = false)
	@ToString.Exclude
	private Booking booking;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@ToString.Exclude
	private User user;

	@Column(name = "razorpay_refund_id", length = 100)
	private String razorpayRefundId;

	@Column(name = "refunded_amount", precision = 10, scale = 2)
	private BigDecimal refundedAmount;

	@Column(name = "refund_reason", length = 255)
	private String refundReason;

	@Column(name = "refunded_at")
	private LocalDateTime refundedAt;

	@Column(name = "failure_reason", length = 500)
	private String failureReason;

}
