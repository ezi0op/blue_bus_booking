package com.bluebus.booking.entity;

import com.bluebus.booking.dto.enums.BusSeatType;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "seats", uniqueConstraints = {
		@UniqueConstraint(name = "uk_seat_bus_seatNumber", columnNames = { "bus_id", "seat_number" }) }, indexes = {
				@Index(name = "idx_seat_bus", columnList = "bus_id"),
				@Index(name = "idx_seat_is_active", columnList = "is_active") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Seat number is required")
	@Column(name = "seat_number", nullable = false, length = 10)
	private String seatNumber; // A1, B2, etc.

	@NotNull(message = "Seat type is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private BusSeatType seatType; // SLEEPER / SEATER

	@NotNull
	@Min(1)
	@Column(name = "seat_row")
	private Integer rowNumber;

	@NotNull
	@Min(1)
	@Column(name = "seat_column")
	private Integer columnNumber;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isWindow = false;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isAisle = false;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

	// Relationship: Many seats → one bus
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bus_id", nullable = false)
	@ToString.Exclude
	private Bus bus;
}