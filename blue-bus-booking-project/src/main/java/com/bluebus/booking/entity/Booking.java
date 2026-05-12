package com.bluebus.booking.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.bluebus.booking.dto.enums.BookingStatus;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "bookings", indexes = { @Index(name = "idx_booking_user", columnList = "user_id"),
		@Index(name = "idx_booking_trip", columnList = "trip_id"),
		@Index(name = "idx_booking_reference", columnList = "booking_reference") })

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Many bookings → one user
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@ToString.Exclude
	private User user;

	// Many bookings → one trip
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "trip_id", nullable = false)
	@ToString.Exclude
	private Trip trip;

	@NotBlank
	@Column(nullable = false, unique = true, length = 50)
	private String bookingReference; // PNR

	@NotNull
	@PositiveOrZero
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@Builder.Default
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal discountAmount = BigDecimal.ZERO;

	@Column(length = 50)
	private String appliedCouponCode;

	@Builder.Default
	@Column(nullable = false)
	private Boolean paymentCompleted = false;

	@NotNull
	@PositiveOrZero
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal finalAmount;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private BookingStatus status; // PENDING, CONFIRMED, CANCELLED

	@NotBlank
	@Email
	@Column(nullable = false, length = 150)
	private String contactEmail;

	@NotBlank
	@Pattern(regexp = "^[6-9]\\d{9}$")
	@Column(nullable = false, length = 10)
	private String contactPhone;

	// One booking → many seats
	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<BookingItem> bookingItems;

	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<Payment> payments;

	// One booking → many seat availability records
	@OneToMany(mappedBy = "booking", fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<SeatAvailability> seatAvailabilities;

	private LocalDateTime cancellationTime;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime bookingTime;
}