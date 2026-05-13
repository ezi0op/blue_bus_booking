package com.bluebus.booking.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.AssertTrue;
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
@Table(name = "routes", uniqueConstraints = { @UniqueConstraint(name = "uk_route_source_destination", columnNames = {
		"source", "destination" }) }, indexes = {
				@Index(name = "idx_route_source_destination", columnList = "source, destination") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Source is required")
	@Column(nullable = false, length = 100)
	private String source;

	@NotBlank(message = "Destination is required")
	@Column(nullable = false, length = 100)
	private String destination;

	@Column(length = 1000)
	private String image;

	@NotNull
	@DecimalMin("0.1")
	@Column(nullable = false)
	private Double distance; // in KM

	@NotNull
	@Min(1)
	@Column(nullable = false)
	private Integer duration; // in minutes

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

	// One route → many stops
	@OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@ToString.Exclude
	@com.fasterxml.jackson.annotation.JsonIgnore
	private List<Stop> stops;

	// One route → many trips
	@OneToMany(mappedBy = "route", fetch = FetchType.LAZY)
	@ToString.Exclude
	@com.fasterxml.jackson.annotation.JsonIgnore
	private List<Trip> trips;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	@PreUpdate
	private void normalize() {
		if (source != null)
			source = source.trim().toUpperCase();
		if (destination != null)
			destination = destination.trim().toUpperCase();
	}

	@AssertTrue(message = "Source and destination cannot be same")
	public boolean isValidRoute() {
		if (source == null || destination == null)
			return true;
		return !source.equalsIgnoreCase(destination);
	}
}