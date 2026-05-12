package com.bluebus.booking.service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Payment;

public interface EmailService {

	void sendWelcomeEmail(String toEmail, String userName);

	void sendBookingConfirmation(Booking booking);

	void sendPaymentSuccess(Booking booking, Payment payment);

	void sendPaymentFailed(Booking booking);

	void sendRefundConfirmation(Booking booking, Payment payment);

	void sendBookingCancellation(Booking booking);

	void sendChatNotificationEmail(String toEmail, String subject, String body);

	void sendVerificationEmail(String to, String token);
}