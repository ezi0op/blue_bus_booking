package com.bluebus.booking.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.bluebus.booking.dto.enums.DeckType;
import com.bluebus.booking.dto.enums.SeatType;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seat_preferences", indexes = { @Index(name = "idx_seat_pref_user", columnList = "user_id") })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatPreference {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	// Preferred seat type → WINDOW / AISLE / NO_PREFERENCE
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	@Builder.Default
	private SeatType preferredSeatType = SeatType.NO_PREFERENCE;

	// Preferred deck → LOWER / UPPER / NO_PREFERENCE
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	@Builder.Default
	private DeckType preferredDeckType = DeckType.NO_PREFERENCE;

	// How many times user picked window seat
	@Builder.Default
	@Column(nullable = false)
	private Integer windowCount = 0;

	// How many times user picked aisle seat
	@Builder.Default
	@Column(nullable = false)
	private Integer aisleCount = 0;

	// How many times user picked lower berth
	@Builder.Default
	@Column(nullable = false)
	private Integer lowerBerthCount = 0;

	// How many times user picked upper berth
	@Builder.Default
	@Column(nullable = false)
	private Integer upperBerthCount = 0;

	// Total bookings analysed
	@Builder.Default
	@Column(nullable = false)
	private Integer totalBookingsAnalysed = 0;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	private LocalDateTime updatedAt;

}
