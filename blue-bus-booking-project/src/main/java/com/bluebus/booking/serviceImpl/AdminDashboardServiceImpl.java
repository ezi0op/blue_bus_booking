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

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
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

		log.info("Fetching dashboard summary data...");
		try {

			Long totalUsers = userRepository.count();

			Long totalBooking = bookingRepository.count();

			Long totalTrips = tripRepository.count();
			Long totalBuses = busRepository.count();

			Long totalBusOperaors = busRepository.countDistinctBusOperators();

			Long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

			Long successfulPayments = paymentRepository.countByStatus(PaymentStatus.SUCCESS);

			Long pendingPayments = paymentRepository.countByStatus(PaymentStatus.PENDING);

			Long totalRefunds = paymentRepository.countByStatus(PaymentStatus.CANCELLED);

			BigDecimal totalRevenue = paymentRepository.getTotalRevenue();

			if (totalRevenue == null) {
				log.warn("Total revenue is null, setting it to zero");
				totalRevenue = BigDecimal.ZERO;
			}
			String mostUsedCoupon = paymentRepository.findMostUsedCoupon();

			if (mostUsedCoupon == null || mostUsedCoupon.isBlank()) {
				log.warn("Most used coupon is null or blank, setting it to 'No coupon used'");

				mostUsedCoupon = "No coupon used";
			}

			BigDecimal totalDiscountGiven = paymentRepository.getTotalDiscountGiven();

			if (totalDiscountGiven == null) {
				log.warn("Total discount given is null, setting it to zero");
				totalDiscountGiven = BigDecimal.ZERO;
			}
			log.info(
					"Dashboard summary fetched successfully. Total Users: {}, Total Bookings: {}, Total Revenue: {}, Total Trips: {}, Total Buses: {}, Total Bus Operators: {}, Cancelled Bookings: {}, Successful Payments: {}, Pending Payments: {}, Total Refunds: {}, Most Used Coupon: {}, Total Discount Given: {}",
					totalUsers, totalBooking, totalRevenue, totalTrips, totalBuses, totalBusOperaors, cancelledBookings,
					successfulPayments, pendingPayments, totalRefunds, mostUsedCoupon, totalDiscountGiven);
			return DashboardSummaryDTO.builder().totalUsers(totalUsers).totalBookings(totalBooking)
					.totalRevenue(totalRevenue).totalTrips(totalTrips).totalBuses(totalBuses)
					.totalBusOperators(totalBusOperaors).cancelledBookings(cancelledBookings)
					.successfulPayments(successfulPayments).pendingPayments(pendingPayments).totalRefunds(totalRefunds)
					.mostUsedCoupon(mostUsedCoupon).totalDiscountGiven(totalDiscountGiven).build();
		} catch (Exception e) {
			log.error("Error while fetching admin dashboard summary", e);
			throw e;

		}
	}

	@Override
	public AIAnalyticsDTO getAIAnalytics() {
		log.info("Fetching AI analytics data...");
		try {

			Long chatbotUsageCount = chatMessageRepository.count();

			String topRoute = bookingRepository.findTopBookedRoute();

			if (topRoute == null || topRoute.isBlank()) {
				log.warn("Top route is null or blank, setting it to 'No route data'");
				topRoute = "No route data";
			}

			SeatType preferredSeatType = seatPreferenceRepository.findMostPreferredSeatType();

			if (preferredSeatType == null) {
				log.warn("Preferred seat type is null, setting it to NO_PREFERENCE");
				preferredSeatType = SeatType.NO_PREFERENCE;
			}

			log.info("AI analytics fetched successfully. Chatbot Usage: {}, Top Route: {}, Preferred Seat Type: {}",
					chatbotUsageCount, topRoute, preferredSeatType);

			return AIAnalyticsDTO.builder().mostSearchedRoute(topRoute).topRecommendedRoute(topRoute)
					.mostPreferredSeatType(preferredSeatType).chatbotUsageCount(chatbotUsageCount).build();
		} catch (Exception e) {
			log.error("Error while fetching AI analytics data", e);
			throw e;

		}
	}

}
