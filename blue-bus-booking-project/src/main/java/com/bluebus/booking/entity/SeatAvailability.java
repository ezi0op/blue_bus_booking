package com.bluebus.booking.entity;

import java.time.LocalDateTime;

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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "seat_availability", uniqueConstraints = {
		@UniqueConstraint(name = "uk_trip_seat", columnNames = { "trip_id", "seat_id" }) }, indexes = {
				@Index(name = "idx_seat_trip", columnList = "trip_id"),
				@Index(name = "idx_seat_availability_seat", columnList = "seat_id"),
				@Index(name = "idx_seat_availability_booking", columnList = "booking_id") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatAvailability {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Many records → one trip
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "trip_id", nullable = false)
	@ToString.Exclude
	private Trip trip;

	// Many records → one seat
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "seat_id", nullable = false)
	@ToString.Exclude
	private Seat seat;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "booking_id")
	private Booking booking;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isBooked = false;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isLocked = false;

	private LocalDateTime lockTime;

	private LocalDateTime lockExpiryTime;

}