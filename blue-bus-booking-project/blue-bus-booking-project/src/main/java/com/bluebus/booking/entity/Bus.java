package com.bluebus.booking.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.bluebus.booking.dto.enums.BusType;

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
@Table(name = "buses", indexes = { @Index(name = "idx_bus_number", columnList = "busNumber") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Bus number is required")
	@Column(nullable = false, unique = true, length = 50)
	private String busNumber;

	@NotNull(message = "Bus type is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private BusType busType; // AC, NON_AC, SLEEPER

	@NotNull(message = "Total seats required")
	@Min(1)
	@Column(nullable = false)
	private Integer totalSeats;

	@Column(length = 1000)
	private String image;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

	// Relationship: Many buses → one operator
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "operator_id", nullable = false)
	@ToString.Exclude
	private BusOperator operator;

	// Relationship: One bus → many seats
	@OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<Seat> seats;

	@OneToMany(mappedBy = "bus", fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<Trip> trips;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
}