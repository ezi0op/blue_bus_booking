package com.bluebus.booking.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.bluebus.booking.dto.enums.TripStatus;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "trips", indexes = { @Index(name = "idx_trip_route_date", columnList = "route_id, journey_date,status"),
		@Index(name = "idx_trip_bus", columnList = "bus_id") }, uniqueConstraints = {
				@UniqueConstraint(name = "uk_trip_unique", columnNames = { "bus_id", "route_id", "departure_time" }) })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Many trips → one bus
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bus_id", nullable = false)
	@ToString.Exclude
	private Bus bus;

	// Many trips → one route
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "route_id", nullable = false)
	@ToString.Exclude
	private Route route;

	@NotNull
	@Column(nullable = false)
	private LocalDate journeyDate;

	@NotNull
	@Future(message = "Departure time must be in future")
	@Column(nullable = false)
	private LocalTime departureTime;

	@NotNull
	@Column(nullable = false)
	private LocalDateTime arrivalTime;

	@NotNull
	@Positive(message = "Price must be positive")
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Min(0)
	@Column(nullable = false)
	private Integer totalSeats = 0;

	@Min(0)
	@Column(nullable = false)
	private Integer availableSeats = 0;

	@Min(0)
	@Column(nullable = false)
	private Integer bookedSeats = 0;

	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TripStatus status = TripStatus.SCHEDULED; // SCHEDULED, CANCELLED, COMPLETED

	@Column(precision = 3, scale = 1)
	@DecimalMin("0.0")
	@DecimalMax("5.0")
	private BigDecimal rating;

	// One trip → many seat availability records
	@OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<SeatAvailability> seatAvailabilities;

	// One trip → many bookings
	@OneToMany(mappedBy = "trip", fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<Booking> bookings;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime cancelledAt;

	@AssertTrue(message = "Arrival time must be after departure time")
	public boolean isArrivalAfterDeparture() {

		if (journeyDate == null || departureTime == null || arrivalTime == null) {
			return true;
		}

		LocalDateTime departureDateTime = LocalDateTime.of(journeyDate, departureTime);

		return arrivalTime.isAfter(departureDateTime);
	}

	@AssertTrue(message = "Journey date is required")
	public boolean isJourneyDateValid() {
		return journeyDate != null;
	}

	@PrePersist
	@PreUpdate
	private void syncSeatCounts() {
		if (totalSeats != null && bookedSeats != null) {
			this.availableSeats = Math.max(0, totalSeats - bookedSeats);
		}
	}
}