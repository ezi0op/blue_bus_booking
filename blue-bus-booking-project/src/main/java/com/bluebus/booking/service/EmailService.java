package com.bluebus.booking.service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Payment;

public interface EmailService {

	void sendWelcomeEmail(String toEmail, String userName);

	void sendBookingConfirmation(Booking booking);

	void sendPaymentSuccess(String toEmail, String bookingRef, String paymentId, java.math.BigDecimal amount);

	void sendPaymentFailed(String toEmail, String bookingRef);

	void sendRefundConfirmation(String toEmail, String bookingRef, java.math.BigDecimal amount, String reason);

	void sendBookingCancellation(String contactEmail, String bookingReference, String source, String destination, String journeyDate);

	void sendChatNotificationEmail(String toEmail, String subject, String body);

	void sendVerificationEmail(String to, String token);
}