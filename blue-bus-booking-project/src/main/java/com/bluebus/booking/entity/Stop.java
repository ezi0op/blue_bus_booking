package com.bluebus.booking.entity;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
@Table(name = "stops", uniqueConstraints = {
		@UniqueConstraint(name = "uk_route_sequence", columnNames = { "route_id", "sequence_order" }) }, indexes = {
				@Index(name = "idx_stop_route_sequence", columnList = "route_id, sequence_order") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stop {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Stop name is required")
	@Column(nullable = false, length = 100)
	private String name;

	@NotNull
	@Min(1)
	@Column(name = "sequence_order", nullable = false)
	private Integer sequenceOrder; // order in route (1,2,3...)

	@NotNull(message = "Arrival time is required")
	private LocalTime arrivalTime;

	@NotNull(message = "Departure time is required")
	private LocalTime departureTime;

	@DecimalMin(value = "-90.0")
	@DecimalMax(value = "90.0")
	private Double latitude;

	@DecimalMin(value = "-180.0")
	@DecimalMax(value = "180.0")
	private Double longitude;

	@Builder.Default
	@Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
	private Boolean isActive = true;

	// Many stops → one route
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "route_id", nullable = false)
	@ToString.Exclude
	private Route route;

	@AssertTrue(message = "Departure time must be after arrival time")
	public boolean isValidTime() {
		if (arrivalTime == null || departureTime == null)
			return true;
		return departureTime.isAfter(arrivalTime);
	}
	
	
	@PrePersist
	@PreUpdate
	private void normalize() {
	    if (name != null) name = name.trim().toUpperCase();
	}
}