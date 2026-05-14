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
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "bus_operators", indexes = { @Index(name = "idx_operator_name", columnList = "name") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusOperator {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Operator name is required")
	@Size(min = 2, max = 100)
	@Column(nullable = false, length = 100)
	private String name;

	@Email(message = "Invalid email format")
	@Column(length = 150)
	private String contactEmail;

	@Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
	@Column(length = 10)
	private String contactPhone;

	@Column(length = 50, unique = true)
	private String licenseNumber;

	@Column(length = 1000)
	private String image;

	@Builder.Default
	@Column(nullable = false)
	private Boolean isActive = true;

	@DecimalMin(value = "0.0")
	@DecimalMax(value = "5.0")
	private Double rating;

	@OneToMany(mappedBy = "operator", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@ToString.Exclude
	private List<Bus> buses;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

}
