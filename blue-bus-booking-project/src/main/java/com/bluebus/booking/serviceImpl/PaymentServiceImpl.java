package com.bluebus.booking.serviceImpl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bluebus.booking.dto.CreatePaymentRequestDTO;
import com.bluebus.booking.dto.PaymentResponseDTO;
import com.bluebus.booking.dto.VerifyPaymentRequestDTO;
import com.bluebus.booking.dto.enums.BookingStatus;
import com.bluebus.booking.dto.enums.PaymentMethod;
import com.bluebus.booking.dto.enums.PaymentStatus;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.BookingItem;
import com.bluebus.booking.entity.Payment;
import com.bluebus.booking.entity.SeatAvailability;
import com.bluebus.booking.repository.BookingRepository;
import com.bluebus.booking.repository.PaymentRepository;
import com.bluebus.booking.repository.SeatAvailabilityRepository;
import com.bluebus.booking.service.CancellationPolicyService;
import com.bluebus.booking.service.CouponService;
import com.bluebus.booking.service.EmailService;
import com.bluebus.booking.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class PaymentServiceImpl implements PaymentService {

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private RazorpayClient razorpayClient;

	@Autowired
	private BookingRepository bookingRepository;

	@Autowired
	private SeatAvailabilityRepository seatAvailabilityRepository;

	@Autowired
	private EmailService emailService;

	@Autowired
	private CancellationPolicyService cancellationPolicyService;

	@Autowired
	private CouponService couponService;

	@Override
	public PaymentResponseDTO createOrder(CreatePaymentRequestDTO request) {

		Long bookingId = request.getBookingId();

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("Booking not found"));

		/*
		 * Start with booking final amount
		 */
		BigDecimal amount = booking.getFinalAmount();

		/*
		 * Fetch discount and coupon info already saved in the Booking entity
		 */
		String usedCouponCode = booking.getAppliedCouponCode();
		BigDecimal originalAmount = booking.getTotalAmount();
		BigDecimal discountApplied = booking.getDiscountAmount() != null ? booking.getDiscountAmount()
				: BigDecimal.ZERO;

		/*
		 * Create REAL Razorpay Order
		 */
		String razorpayOrderId = null;
		try {
			JSONObject orderRequest = new JSONObject();
			orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // amount in paise
			orderRequest.put("currency", "INR");
			orderRequest.put("receipt", "rcpt_" + bookingId);

			com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
			razorpayOrderId = order.get("id");
			log.info("Razorpay Order created: {}", razorpayOrderId);
		} catch (Exception e) {
			log.error("Failed to create Razorpay Order: {}", e.getMessage());
			// Fallback to demo ID if you want to keep testing, but it will fail in modal
			// razorpayOrderId = "order_demo_" + UUID.randomUUID().toString().substring(0,
			// 10);
			throw new RuntimeException("Payment Initialization Failed: " + e.getMessage());
		}

		Payment payment = Payment.builder().booking(booking).user(booking.getUser()).amount(amount)
				.usedCouponCode(usedCouponCode).discountApplied(discountApplied).currency("INR")
				.status(PaymentStatus.PENDING).razorpayOrderId(razorpayOrderId).createdAt(LocalDateTime.now()).build();

		paymentRepository.save(payment);

		return PaymentResponseDTO.builder().bookingId(booking.getId()).razorpayOrderId(razorpayOrderId)
				.razorpayPaymentId(null).amount(amount).currency("INR").paymentStatus(PaymentStatus.PENDING.name())
				.message("Order created successfully").build();
	}

	@Override
	public void verifyPayment(VerifyPaymentRequestDTO request) {
		String razorpayOrderId = request.getRazorpayOrderId();
		String razorpayPaymentId = request.getRazorpayPaymentId();
		String razorpaySignature = request.getRazorpaySignature();

		Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
				.orElseThrow(() -> new RuntimeException("Payment not found"));

		payment.setRazorpayPaymentId(razorpayPaymentId);
		payment.setRazorpaySignature(razorpaySignature);
		payment.setPaymentMethod(request.getPaymentMethod());
		payment.setStatus(PaymentStatus.SUCCESS);
		payment.setPaidAt(LocalDateTime.now());

		Booking booking = payment.getBooking();
		booking.setStatus(BookingStatus.CONFIRMED);
		booking.setPaymentCompleted(true);

		List<BookingItem> items = booking.getBookingItems();

		for (BookingItem item : items) {
			SeatAvailability seat = seatAvailabilityRepository
					.findByTripIdAndSeatId(booking.getTrip().getId(), item.getSeat().getId())
					.orElseThrow(() -> new RuntimeException("Seat not found"));

			seat.setIsBooked(true);
			seat.setIsLocked(false);
			seat.setLockTime(null);
			seat.setLockExpiryTime(null);
			seat.setBooking(booking);

			seatAvailabilityRepository.save(seat);
		}

		paymentRepository.save(payment);
		bookingRepository.save(booking);
		// Send success email
		emailService.sendPaymentSuccess(booking, payment);

	}

	@Override
	public void markPaymentFailed(VerifyPaymentRequestDTO request) {
		String razorpayOrderId = request.getRazorpayOrderId();

		Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
				.orElseThrow(() -> new RuntimeException("Payment not found"));

		payment.setStatus(PaymentStatus.FAILED);

		Booking booking = payment.getBooking();
		booking.setStatus(BookingStatus.CANCELLED);
		booking.setPaymentCompleted(false);

		paymentRepository.save(payment);
		bookingRepository.save(booking);

		// Send failure email
		emailService.sendPaymentFailed(booking);
	}

	// get payment by booking id
	@Override
	public PaymentResponseDTO getPaymentByBookingId(Long bookingId) {

		Payment payment = paymentRepository
				.findTopByBookingIdAndStatusOrderByCreatedAtDesc(bookingId, PaymentStatus.SUCCESS)
				.orElseThrow(() -> new RuntimeException("Payment not found for boking:" + bookingId));

		return PaymentResponseDTO.builder().bookingId(payment.getBooking().getId())
				.razorpayOrderId(payment.getRazorpayOrderId()).razorpayPaymentId(payment.getRazorpayPaymentId())
				.amount(payment.getAmount()).currency(payment.getCurrency()).paymentStatus(payment.getStatus().name())
				.paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod() : PaymentMethod.UPI)
				.message("Payment details fetched successfully").build();

	}

	@Override
	@Transactional
	public PaymentResponseDTO processRefund(Long bookingId, String reason) {
		Payment payment = paymentRepository
				.findTopByBookingIdAndStatusOrderByCreatedAtDesc(bookingId, PaymentStatus.SUCCESS)
				.orElseThrow(() -> new RuntimeException("Payment not found for boking:" + bookingId));

//		 refund allowed only for successful payments

		if (payment.getStatus() != PaymentStatus.SUCCESS) {
			throw new RuntimeException("Refund not applicable for payment status: " + payment.getStatus());
		}

		Booking booking = payment.getBooking();

		// calculate refund based on cancellation timing
		BigDecimal refundAmount = cancellationPolicyService.calculateRefundAmount(bookingId);

		String razorpayRefundId = null;

		if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
			razorpayRefundId = initiateRazorpayRefund(payment.getRazorpayPaymentId(), refundAmount);
		}

		payment.setRazorpayRefundId(razorpayRefundId);

		// update payment
		payment.setRefundedAmount(refundAmount);
		payment.setRefundReason(reason);
		payment.setRefundedAt(LocalDateTime.now());

		if (refundAmount.compareTo(payment.getAmount()) == 0) {
			payment.setStatus(PaymentStatus.REFUNDED);
		} else if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
			payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
		} else {
			payment.setStatus(PaymentStatus.CANCELLED);
		}

		// update booking
		booking.setStatus(BookingStatus.CANCELLED);
		booking.setPaymentCompleted(false);
		booking.setCancellationTime(LocalDateTime.now());

		// free booked seats
		freeSeats(booking);

		paymentRepository.save(payment);
		bookingRepository.save(booking);
		// Send emails
		emailService.sendRefundConfirmation(booking, payment);
		emailService.sendBookingCancellation(booking);

		log.info("Refund processed successfully for booking {}", bookingId);

		return PaymentResponseDTO.builder().bookingId(bookingId).razorpayOrderId(payment.getRazorpayOrderId())
				.razorpayPaymentId(payment.getRazorpayPaymentId()).amount(payment.getAmount())
				.refundedAmount(refundAmount).currency(payment.getCurrency()).paymentStatus(payment.getStatus().name())
				.refundReason(reason).message("Refund processed successfully").build();

	}

	private String initiateRazorpayRefund(String razorpayPaymentId, BigDecimal refundAmount) {
		try {
			JSONObject refundRequest = new JSONObject();

			// Razorpay accepts amount in paise (1 INR = 100 paise)
			refundRequest.put("amount", refundAmount.multiply(BigDecimal.valueOf(100)).intValue());

			Refund refund = razorpayClient.payments.refund(razorpayPaymentId, refundRequest);

			String refundId = refund.get("id");
			log.info("Razorpay refund initiated — refundId: {} | amount: ₹{}", refundId, refundAmount);

			return refundId;

		} catch (Exception e) {
			log.error("Razorpay refund failed: {}", e.getMessage());
			throw new RuntimeException("Refund failed: " + e.getMessage());
		}
	}

	private void freeSeats(Booking booking) {

		List<BookingItem> items = booking.getBookingItems();

		for (BookingItem item : items) {

			seatAvailabilityRepository.findByTripIdAndSeatId(booking.getTrip().getId(), item.getSeat().getId())
					.ifPresent(seat -> {
						seat.setIsBooked(false);
						seat.setIsLocked(false);
						seat.setLockTime(null);
						seat.setLockExpiryTime(null);
						seat.setBooking(null);

						seatAvailabilityRepository.save(seat);
					});
		}
	}

	@Override
	public void processOfflinePayment(CreatePaymentRequestDTO request, PaymentMethod paymentMethod) {
		Long bookingId = request.getBookingId();

		Booking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new RuntimeException("Booking not found"));

		BigDecimal amount = booking.getFinalAmount();
		String usedCouponCode = booking.getAppliedCouponCode();
		BigDecimal discountApplied = booking.getDiscountAmount() != null ? booking.getDiscountAmount()
				: BigDecimal.ZERO;

		Payment payment = Payment.builder().booking(booking).user(booking.getUser()).amount(amount)
				.usedCouponCode(usedCouponCode).discountApplied(discountApplied).currency("INR")
				.status(PaymentStatus.SUCCESS).paymentMethod(paymentMethod)
				.razorpayOrderId("OFFLINE_" + UUID.randomUUID().toString()).paidAt(LocalDateTime.now())
				.createdAt(LocalDateTime.now()).build();

		booking.setStatus(BookingStatus.CONFIRMED);
		booking.setPaymentCompleted(true);

		List<BookingItem> items = booking.getBookingItems();

		for (BookingItem item : items) {
			SeatAvailability seat = seatAvailabilityRepository
					.findByTripIdAndSeatId(booking.getTrip().getId(), item.getSeat().getId())
					.orElseThrow(() -> new RuntimeException("Seat not found"));

			seat.setIsBooked(true);
			seat.setIsLocked(false);
			seat.setLockTime(null);
			seat.setLockExpiryTime(null);
			seat.setBooking(booking);

			seatAvailabilityRepository.save(seat);
		}

		paymentRepository.save(payment);
		bookingRepository.save(booking);

		// Send success email
		emailService.sendPaymentSuccess(booking, payment);
	}

}
