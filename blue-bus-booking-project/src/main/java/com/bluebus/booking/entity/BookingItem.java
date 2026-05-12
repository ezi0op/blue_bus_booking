package com.bluebus.booking.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "booking_items", uniqueConstraints = {
		@UniqueConstraint(name = "uk_booking_seat", columnNames = { "booking_id", "seat_id" }) }, indexes = {
				@Index(name = "idx_booking_item_booking", columnList = "booking_id"),
				@Index(name = "idx_booking_item_seat", columnList = "seat_id") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Many items → one booking
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "booking_id", nullable = false)
	@ToString.Exclude
	private Booking booking;

	// Each item corresponds to one seat
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "seat_id", nullable = false)
	private Seat seat;

	@NotBlank(message = "Passenger name is required")
	@Column(nullable = false, length = 100)
	private String passengerName;

	@NotNull(message = "Passenger age is required")
	@Min(1)
	@Max(120)
	@Column(nullable = false)
	private Integer passengerAge;

	@NotBlank(message = "Gender is required")
	@Column(nullable = false, length = 10)
	private String passengerGender;

	@NotNull
	@Positive
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal price;
}