package com.bluebus.booking.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.Payment;
import com.bluebus.booking.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional
public class EmailServiceImpl implements EmailService {

	@Autowired
	private JavaMailSender mailSender;

	@Value("${spring.mail.username}")
	private String fromEmail;

	@Override
	@Async
	public void sendWelcomeEmail(String toEmail, String userName) {
		String subject = "Welcome to Blue Bus Booking 🚌";
		String content = "<h2>Hello " + userName + "!</h2>"
				+ "<p>Welcome to <strong>Blue Bus Booking</strong>! We're thrilled to have you on board.</p>"
				+ "<p>Your account has been created successfully. You can now:</p>"
				+ "<ul>"
				+ "  <li>Search for premium bus trips</li>"
				+ "  <li>Book seats in seconds</li>"
				+ "  <li>Manage your bookings anywhere, anytime</li>"
				+ "</ul>"
				+ "<div style='text-align: center; margin-top: 30px;'>"
				+ "  <a href='http://localhost:5173/' style='background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Start Booking Now</a>"
				+ "</div>";

		sendHtmlEmail(toEmail, subject, content);
	}

	@Override
	@Async
	public void sendBookingConfirmation(String toEmail, String reference, String source, String destination, String date) {
		String subject = "Booking Confirmation - " + reference;
		String content = "<h2>Booking Received!</h2>"
				+ "<p>Your booking has been initiated successfully. Here are your trip details:</p>"
				+ "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;'>"
				+ "  <p><strong>Reference:</strong> " + reference + "</p>"
				+ "  <p><strong>Route:</strong> " + source + " → " + destination + "</p>"
				+ "  <p><strong>Date:</strong> " + date + "</p>"
				+ "</div>"
				+ "<p style='color: #ef4444; font-weight: bold;'>Please complete your payment within 10 minutes to confirm your seats.</p>";

		sendHtmlEmail(toEmail, subject, content);
	}

	@Override
	@Async
	public void sendPaymentSuccess(String toEmail, String bookingRef, String paymentId, java.math.BigDecimal amount) {
		String subject = "Payment Successful ✅ - Seat Confirmed";
		String content = "<h2 style='color: #16a34a;'>Payment Successful!</h2>"
				+ "<p>Great news! Your payment has been processed and your journey is confirmed.</p>"
				+ "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;'>"
				+ "  <p><strong>Booking ID:</strong> #" + bookingRef + "</p>"
				+ "  <p><strong>Payment ID:</strong> " + paymentId + "</p>"
				+ "  <p><strong>Amount Paid:</strong> ₹" + amount + "</p>"
				+ "  <p><strong>Status:</strong> <span style='color: #16a34a; font-weight: bold;'>CONFIRMED</span></p>"
				+ "</div>"
				+ "<p>You can download your ticket and invoice from the app. Safe journey!</p>";

		sendHtmlEmail(toEmail, subject, content);
	}

	@Override
	@Async
	public void sendPaymentFailed(String toEmail, String bookingRef) {
		String subject = "Payment Failed ❌ - Action Required";
		String content = "<h2 style='color: #dc2626;'>Payment Failed</h2>"
				+ "<p>We were unable to process your payment for booking <strong>#" + bookingRef + "</strong>.</p>"
				+ "<p>As a result, your booking has been automatically cancelled and your seats have been released.</p>"
				+ "<p>Please try booking again. If money was deducted, it will be refunded automatically within 5-7 business days.</p>";

		sendHtmlEmail(toEmail, subject, content);
	}

	@Override
	@Async
	public void sendRefundConfirmation(String toEmail, String bookingRef, java.math.BigDecimal amount, String reason) {
		String subject = "Refund Processed 💰";
		String content = "<h2>Refund Initiated</h2>"
				+ "<p>Your refund for booking <strong>#" + bookingRef + "</strong> has been initiated.</p>"
				+ "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;'>"
				+ "  <p><strong>Refund Amount:</strong> ₹" + amount + "</p>"
				+ "  <p><strong>Reason:</strong> " + reason + "</p>"
				+ "</div>"
				+ "<p>The amount will reflect in your original payment method within 5–7 business days.</p>";

		sendHtmlEmail(toEmail, subject, content);
	}

	@Override
	@Async
	public void sendBookingCancellation(String contactEmail, String bookingReference, String source, String destination, String journeyDate) {
		String subject = "Booking Cancelled 🚫";
		String content = "<h2>Booking Cancelled</h2>"
				+ "<p>Your booking <strong>#" + bookingReference + "</strong> has been successfully cancelled.</p>"
				+ "<p>Route: " + source + " → " + destination + "</p>"
				+ "<p>Date: " + journeyDate + "</p>"
				+ "<p>We hope to see you again soon!</p>";

		sendHtmlEmail(contactEmail, subject, content);
	}

	@Override
	@Async
	public void sendChatNotificationEmail(String toEmail, String subject, String body) {
		String content = "<h2>New Message from Support</h2>"
				+ "<p>" + body.replace("\n", "<br>") + "</p>";
		sendHtmlEmail(toEmail, subject, content);
	}


	private void sendHtmlEmail(String toEmail, String subject, String content) {
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(fromEmail);
			helper.setTo(toEmail);
			helper.setSubject(subject);
			helper.setText(getHtmlTemplate(content), true);

			mailSender.send(message);
			log.info("Beautiful HTML Email sent to {}", toEmail);
		} catch (Exception e) {
			log.error("Failed to send HTML email to {}: {}", toEmail, e.getMessage());
		}
	}

	private String getHtmlTemplate(String content) {
		return "<html><body style='margin: 0; padding: 0; background-color: #f9fafb; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>"
				+ "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: #f9fafb; padding: 40px 20px;'>"
				+ "  <tr>"
				+ "    <td align='center'>"
				+ "      <table width='100%' max-width='600px' style='background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;'>"
				+ "        <!-- Header -->"
				+ "        <tr>"
				+ "          <td style='background-color: #2563eb; padding: 30px; text-align: center;'>"
				+ "            <h1 style='color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;'>BLUE BUS 🚌</h1>"
				+ "          </td>"
				+ "        </tr>"
				+ "        <!-- Body -->"
				+ "        <tr>"
				+ "          <td style='padding: 40px; color: #374151; font-size: 16px; line-height: 1.6;'>"
				+              content
				+ "          </td>"
				+ "        </tr>"
				+ "        <!-- Footer -->"
				+ "        <tr>"
				+ "          <td style='padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;'>"
				+ "            <p style='margin: 0;'>&copy; 2026 Blue Bus Booking. Safe & Premium Travel.</p>"
				+ "            <p style='margin: 5px 0 0;'>You received this email because you registered on our platform.</p>"
				+ "          </td>"
				+ "        </tr>"
				+ "      </table>"
				+ "    </td>"
				+ "  </tr>"
				+ "</table>"
				+ "</body></html>";
	}

	@Override
	@Async
	public void sendVerificationEmail(String toEmail, String token) {
		String subject = "Verify Your Account - Blue Bus Booking 🛡️";
		String verificationLink = "http://localhost:5173/verify/" + token;
		
		String content = "<h2>Almost there!</h2>"
				+ "<p>Thank you for signing up with <strong>Blue Bus Booking</strong>. Please click the button below to verify your email address and activate your account:</p>"
				+ "<div style='text-align: center; margin: 40px 0;'>"
				+ "  <a href='" + verificationLink + "' style='background-color: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);'>Verify Email Address</a>"
				+ "</div>"
				+ "<p>If the button doesn't work, you can copy and paste this link into your browser:</p>"
				+ "<p style='font-size: 12px; color: #6b7280; word-break: break-all;'>" + verificationLink + "</p>"
				+ "<p>This link will expire in 24 hours.</p>";

		sendHtmlEmail(toEmail, subject, content);
	}
}
