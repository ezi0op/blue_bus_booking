package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.AIAnalyticsDTO;
import com.bluebus.booking.dto.DashboardSummaryDTO;
import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.dto.enums.PaymentStatus;
import com.bluebus.booking.dto.enums.SeatType;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.BusRepository;
import com.bluebus.booking.repository.ChatMessageRepository;
import com.bluebus.booking.repository.PaymentRepository;
import com.bluebus.booking.repository.SeatPreferenceRepository;
import com.bluebus.booking.repository.TripRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.AdminDashboardService;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private BusRepository busRepository;

	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private SeatPreferenceRepository seatPreferenceRepository;

	@Override
	public DashboardSummaryDTO getDashboardSummary() {

		Long totalUsers = userRepository.count();

		Long totalBooking = bookingRepository.count();

		Long totalTrips = tripRepository.count();
		Long totalBuses = busRepository.count();
		
		Long totalBusOperaors=busRepository.countDistinctBusOperators();

		Long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

		Long successfulPayments = paymentRepository.countByStatus(PaymentStatus.SUCCESS);

		Long pendingPayments = paymentRepository.countByStatus(PaymentStatus.PENDING);

		Long totalRefunds = paymentRepository.countByStatus(PaymentStatus.CANCELLED);

		BigDecimal totalRevenue = paymentRepository.getTotalRevenue();

		if (totalRevenue == null) {
			totalRevenue = BigDecimal.ZERO;
		}
		String mostUsedCoupon = paymentRepository.findMostUsedCoupon();

		if (mostUsedCoupon == null || mostUsedCoupon.isBlank()) {
			mostUsedCoupon = "No coupon used";
		}

		BigDecimal totalDiscountGiven = paymentRepository.getTotalDiscountGiven();

		if (totalDiscountGiven == null) {
			totalDiscountGiven = BigDecimal.ZERO;
		}
		return DashboardSummaryDTO.builder().totalUsers(totalUsers).totalBookings(totalBooking)
				.totalRevenue(totalRevenue).totalTrips(totalTrips).totalBuses(totalBuses).totalBusOperators(totalBusOperaors)
				.cancelledBookings(cancelledBookings).successfulPayments(successfulPayments)
				.pendingPayments(pendingPayments).totalRefunds(totalRefunds).mostUsedCoupon(mostUsedCoupon)
				.totalDiscountGiven(totalDiscountGiven).build();
	}

	@Override
	public AIAnalyticsDTO getAIAnalytics() {

		Long chatbotUsageCount = chatMessageRepository.count();

		String topRoute = bookingRepository.findTopBookedRoute();

		if (topRoute == null || topRoute.isBlank()) {
			topRoute = "No route data";
		}

		SeatType preferredSeatType = seatPreferenceRepository.findMostPreferredSeatType();

		if (preferredSeatType == null) {
			preferredSeatType = SeatType.NO_PREFERENCE;
		}

		return AIAnalyticsDTO.builder().mostSearchedRoute(topRoute).topRecommendedRoute(topRoute)
				.mostPreferredSeatType(preferredSeatType).chatbotUsageCount(chatbotUsageCount).build();
	}

}
