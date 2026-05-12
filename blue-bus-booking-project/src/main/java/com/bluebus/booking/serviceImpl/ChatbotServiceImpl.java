package com.bluebus.booking.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bluebus.booking.dto.ChatRequestDTO;
import com.bluebus.booking.dto.ChatResponseDTO;
import com.bluebus.booking.dto.PaymentResponseDTO;
import com.bluebus.booking.dto.TripRecommendationDTO;
import com.bluebus.booking.dto.enums.ChatIntent;
import com.bluebus.booking.dto.enums.ChatRole;
import com.bluebus.booking.entity.Booking;
import com.bluebus.booking.entity.ChatMessage;
import com.bluebus.booking.entity.User;
import com.bluebus.booking.repository.ChatMessageRepository;
import com.bluebus.booking.repository.UserRepository;
import com.bluebus.booking.service.AuthService;
import com.bluebus.booking.service.BookingService;
import com.bluebus.booking.service.ChatbotService;
import com.bluebus.booking.service.EmailService;
import com.bluebus.booking.service.PaymentService;
import com.bluebus.booking.service.SmartSearchService;
import com.bluebus.booking.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

	@Autowired
	private ChatClient chatClient;
	
	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private SmartSearchService smartSearchService;

	@Autowired
	private PaymentService paymentService;
	
	@Autowired
	private EmailService emailService;
	
	@Autowired
	private BookingService bookingService;

	@Autowired
	private com.bluebus.booking.repository.BookingRepository bookingRepository;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private AuthService authService;

	private static final String SYSTEM_PROMPT = """
			BLUE BUS BRAND IDENTITY:
			- Persona: You are the 'BlueBus Concierge', a premium, high-end AI travel assistant.
			- Tone: Professional, articulate, and proactive. Use sophisticated yet clear language.

			ACCURATE GUIDANCE (Use these exact names):
			- Main Action: 'Search Buses' button on the home hero section.
			- Trip Action: 'Explore Route' button on search results to see details.
			- User Profile: 'My Account' or the profile icon in the header.
			- Account Features: 'View History', 'Check Status', and 'Download Ticket'.

			CORE CAPABILITIES:
			- Search: Finding trips with precise source, destination, and date details.
			- Account: Listing bookings with status, PNR codes, and route details.
			- Support: Handling payment, cancellation, and refund inquiries (Note: refunds take 5-7 business days).
			- Guidance: Providing step-by-step instructions for navigating the platform.

			PREMIUM FORMATTING:
			1. Use **BOLD** for key data: **PNRs**, **Prices**, **Dates**, and **Statuses**.
			2. Acknowledge references: "Searching for your PNR: **BB-XXXX** now..."
			3. For data lists, use clean bullet points with line breaks for readability.
			4. ALWAYS put your intent on a NEW line at the very end of your response.
			   Example: "I've found the perfect trip for you! [Details...] \nINTENT: SEARCH_TRIP"
			
			Supported intents:
			INTENT: SEARCH_TRIP, INTENT: CANCEL_BOOKING, INTENT: GET_BOOKING_STATUS, 
			INTENT: LIST_MY_BOOKINGS, INTENT: PAYMENT_HELP, INTENT: REFUND_STATUS, INTENT: UNKNOWN

			CRITICAL CONTEXT RULE: If the user provides just a PNR (e.g., BB-XXXX) or Booking ID, look at the conversation history to determine WHY they provided it (e.g., to check payment, refund, or status). Return that corresponding INTENT. If no context exists, return INTENT: GET_BOOKING_STATUS.
			""";

	@Override
	public ChatResponseDTO chat(ChatRequestDTO request) {
		
		// Validate request
		if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
			log.warn("Invalid chat request received");
			return ChatResponseDTO.builder()
					.message("Invalid request. Message cannot be empty.")
					.sessionId(request != null ? request.getSessionId() : "UNKNOWN")
					.intent(ChatIntent.UNKNOWN)
					.timestamp(LocalDateTime.now())
					.build();
		}

		try {
			// Load prev chat history
			List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(request.getSessionId());

			// Convert history into readable prompt
			String conversationContext = history.stream()
					.map(message -> message.getRole() + ": " + message.getContent())
					.collect(Collectors.joining("\n"));

			// Final prompt for Ollama (Mistral)
			String fullPrompt = SYSTEM_PROMPT + "\n\nConversation History:\n" + conversationContext + "\n\nUser: "
					+ request.getMessage();

			// Call Mistral via Ollama
			String aiReply = chatClient.prompt().user(fullPrompt).call().content();
			
			if (aiReply == null || aiReply.trim().isEmpty()) {
				log.warn("Empty response received from AI for session: {}", request.getSessionId());
				aiReply = "I'm having trouble processing your request. Please try again.";
			}

			// Detect intent from AI reply
			ChatIntent intent = detectIntent(aiReply);

			// Manual Fallback: If AI didn't detect intent but user provided a PNR, default to checking status
			if (intent == ChatIntent.UNKNOWN) {
				String extractedPnr = extractBookingReference(request.getMessage(), null);
				if (!extractedPnr.isEmpty()) {
					intent = ChatIntent.GET_BOOKING_STATUS;
				}
			}

			// If SEARCH_TRIP → fetch real trips from SmartSearchService
			Object responseData = null;
			String finalMessage = aiReply;

			if (intent == ChatIntent.SEARCH_TRIP) {
				try {
					List<TripRecommendationDTO> trips = smartSearchService.search(request.getMessage(), request.getUserId());
					if (trips != null && !trips.isEmpty()) {
						responseData = trips;
						finalMessage = "I have found **" + trips.size() + "** available trips for your route. \n\n" + 
								formatTripsList(trips);
					} else {
						finalMessage = "I couldn't find any active trips matching your specific details. Would you like to check a different date or nearby cities?";
					}
				} catch (Exception e) {
					log.debug("Smart search error/skipped: {}", e.getMessage());
					finalMessage = "I couldn't find any buses available for that specific route and date. Could you please double-check the city names or try a different date?";
				}
			}

			if (intent == ChatIntent.CANCEL_BOOKING) {
				try {
					// Search in current message and history
					String reference = extractBookingReference(request.getMessage(), conversationContext);
					Booking booking = bookingRepository.findByBookingReference(reference).orElse(null);
					if (booking == null) booking = bookingService.getBookingByReference(reference);
					
					if (booking != null) {
						paymentService.processRefund(booking.getId(), "Cancelled via AI chatbot");
						finalMessage = "I have successfully processed your request. **Booking #" + reference + "** has been cancelled and your refund is on the way! You will receive an email confirmation shortly.";
					} else {
						// Try by ID as fallback
						Long bookingId = extractBookingId(request.getMessage(), conversationContext);
						if (bookingId > 0) {
							paymentService.processRefund(bookingId, "Cancelled via AI chatbot");
							finalMessage = "I have successfully processed your request. **Booking #" + bookingId + "** has been cancelled and your refund is on the way!";
						}
					}
				} catch (Exception e) {
					log.debug("Extraction or cancellation failed: {}", e.getMessage());
				}
			}

			if (intent == ChatIntent.GET_BOOKING_STATUS) {
				try {
					String reference = extractBookingReference(request.getMessage(), conversationContext);
					Booking booking = bookingRepository.findByBookingReference(reference).orElse(null);
					if (booking == null) booking = bookingService.getBookingByReference(reference);
					
					if (booking == null) {
						Long bookingId = extractBookingId(request.getMessage(), conversationContext);
						if (bookingId > 0) {
							booking = bookingService.getBookingById(bookingId);
						}
					}

					if (booking != null) {
						responseData = mapToSafeBooking(booking);
						finalMessage = "Found it! Booking **#" + (booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + 
								"** is currently **" + booking.getStatus() + 
								"**. \n\nJourney: " + booking.getTrip().getRoute().getSource() + " → " + 
								booking.getTrip().getRoute().getDestination() + " on " + booking.getTrip().getJourneyDate();
					} else {
						finalMessage = "I couldn't find a booking with those details. Could you please double-check your Booking ID or PNR code?";
					}
				} catch (Exception e) {
					log.debug("Booking status check failed: {}", e.getMessage());
				}
			}

			if (intent == ChatIntent.LIST_MY_BOOKINGS) {
				try {
					if (request.getUserId() != null) {
						List<Booking> bookings = bookingService.getBookingsByUser(request.getUserId());
						if (bookings != null && !bookings.isEmpty()) {
							responseData = bookings.stream().map(this::mapToSafeBooking).collect(Collectors.toList());
							finalMessage = "You have **" + bookings.size() + "** bookings in your account. Here are the most recent details:\n\n" + 
									formatBookingsList(bookings);
						} else {
							finalMessage = "Your booking history is currently empty. I can help you plan and book your first journey whenever you're ready!";
						}
					} else {
						finalMessage = "To provide you with personalized booking information, I'll need you to log in to your account first.";
					}
				} catch (Exception e) {
					log.debug("List bookings failed: {}", e.getMessage());
				}
			}

			if (intent == ChatIntent.PAYMENT_HELP) {
				try {
					String reference = extractBookingReference(request.getMessage(), conversationContext);
					Booking booking = bookingRepository.findByBookingReference(reference).orElse(null);
					if (booking == null) booking = bookingService.getBookingByReference(reference);
					
					if (booking == null) {
						Long bookingId = extractBookingId(request.getMessage(), conversationContext);
						if (bookingId > 0) {
							try {
								booking = bookingService.getBookingById(bookingId);
							} catch (Exception e) {
								log.debug("Booking ID {} not found: {}", bookingId, e.getMessage());
							}
						}
					}

					if (booking != null) {
						// Security check
						if (request.getUserId() != null && !booking.getUser().getId().equals(request.getUserId())) {
							finalMessage = "For security reasons, I can only provide payment details for bookings made from your account. Please double-check the PNR or Booking ID.";
						} else {
							try {
								PaymentResponseDTO paymentStatus = paymentService.getPaymentByBookingId(booking.getId());
								if (paymentStatus != null) {
									responseData = paymentStatus;
									finalMessage = "I've retrieved the payment details for **Booking #" + 
											(booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + "**. \n\n" +
											"• **Status:** " + paymentStatus.getPaymentStatus() + "\n" +
											"• **Amount:** ₹" + paymentStatus.getAmount() + "\n" +
											"• **Paid At:** " + (paymentStatus.getPaidAt() != null ? paymentStatus.getPaidAt() : "Pending");
								} else {
									finalMessage = "I found your booking #" + (booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + ", but there is no payment record associated with it yet. If you just paid, please wait a few minutes.";
								}
							} catch (Exception e) {
								log.warn("Payment record not found for booking {}: {}", booking.getId(), e.getMessage());
								finalMessage = "I found your booking #" + (booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + ", but I'm having trouble accessing the payment details right now. It might still be processing.";
							}
						}
					} else {
						finalMessage = "I couldn't find a booking with that ID or PNR. Please provide a valid reference (e.g., BB-XXXX) so I can check the payment status for you.";
					}
				} catch (Exception e) {
					log.error("Serious error in Payment Help", e);
					finalMessage = "I encountered an error while checking your payment. Please try again with your PNR code or contact our support team.";
				}
			}

			if (intent == ChatIntent.REFUND_STATUS) {
				try {
					String reference = extractBookingReference(request.getMessage(), conversationContext);
					Booking booking = bookingRepository.findByBookingReference(reference).orElse(null);
					if (booking == null) booking = bookingService.getBookingByReference(reference);
					
					if (booking == null) {
						Long bookingId = extractBookingId(request.getMessage(), conversationContext);
						if (bookingId > 0) {
							try {
								booking = bookingService.getBookingById(bookingId);
							} catch (Exception e) {
								log.debug("Booking ID {} not found for refund check", bookingId);
							}
						}
					}

					if (booking != null) {
						// Security check
						if (request.getUserId() != null && !booking.getUser().getId().equals(request.getUserId())) {
							finalMessage = "I'm sorry, I can only provide refund status for bookings linked to your account.";
						} else {
							try {
								PaymentResponseDTO refundStatus = paymentService.getPaymentByBookingId(booking.getId());
								if (refundStatus != null) {
									responseData = refundStatus;
									finalMessage = "Regarding your refund for **Booking #" + 
											(booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + "**: \n\n" +
											"• **Status:** " + refundStatus.getPaymentStatus() + "\n" +
											"• **Refund Amount:** ₹" + refundStatus.getRefundedAmount() + "\n" +
											"• **Estimated Date:** " + ("REFUNDED".equalsIgnoreCase(refundStatus.getPaymentStatus()) ? "Processed" : "5-7 business days from cancellation");
								} else {
									finalMessage = "I found your booking #" + (booking.getBookingReference() != null ? booking.getBookingReference() : booking.getId()) + ", but there is no refund record for it yet. Refunds usually process within 5-7 days of cancellation.";
								}
							} catch (Exception e) {
								log.warn("Refund record not found for booking {}: {}", booking.getId(), e.getMessage());
								finalMessage = "I found your booking, but I'm having trouble retrieving the refund details right now. Please check back in a few minutes.";
							}
						}
					} else {
						finalMessage = "I couldn't find a booking with that ID or PNR. Please share your reference so I can check the refund status for you.";
					}
				} catch (Exception e) {
					log.error("Serious error in Refund Status", e);
					finalMessage = "I encountered an error while checking your refund status. Please try again later or contact our support team.";
				}
			}

			// Clean up the intent markers from the final message so user and email don't see them
			finalMessage = finalMessage.replaceAll("(?i)INTENT: [A-Z_]+", "").trim();

			// Save USER message
			saveMessage(request.getUserId(), request.getSessionId(), ChatRole.USER, request.getMessage());

			// Save ASSISTANT reply
			saveMessage(request.getUserId(), request.getSessionId(), ChatRole.ASSISTANT, finalMessage);

			// Send email notification if user is present
			if (request.getUserId() != null) {
				try {
					User user = userRepository.findById(request.getUserId()).orElse(null);
					if (user != null && intent != ChatIntent.UNKNOWN) {
						sendChatNotificationEmail(user, intent, finalMessage);
					}
				} catch (Exception e) {
					log.error("Error sending email notification for session: {}", request.getSessionId(), e);
				}
			}

			return ChatResponseDTO.builder()
					.message(finalMessage)
					.sessionId(request.getSessionId())
					.intent(intent)
					.data(responseData)
					.timestamp(LocalDateTime.now())
					.build();
					
		} catch (Exception e) {
			log.error("Unexpected error in chatbot service for session: {}", request.getSessionId(), e);
			return ChatResponseDTO.builder()
					.message("An unexpected error occurred. Please try again later.")
					.sessionId(request.getSessionId())
					.intent(ChatIntent.UNKNOWN)
					.timestamp(LocalDateTime.now())
					.build();
		}
	}

	private void saveMessage(Long userId, String sessionId, ChatRole role, String content) {
		User user = null;

		if (userId != null) {
			user = userRepository.findById(userId).orElse(null);
		}

		chatMessageRepository
				.save(ChatMessage.builder().user(user).sessionId(sessionId).role(role).content(content).build());
	}

	private ChatIntent detectIntent(String reply) {
		String upper = reply.toUpperCase();

		if (upper.contains("INTENT: SEARCH_TRIP")) {
			return ChatIntent.SEARCH_TRIP;
		}
		if (upper.contains("INTENT: CANCEL_BOOKING")) {
			return ChatIntent.CANCEL_BOOKING;
		}
		if (upper.contains("INTENT: LIST_MY_BOOKINGS")) {
			return ChatIntent.LIST_MY_BOOKINGS;
		}
		if (upper.contains("INTENT: GET_BOOKING_STATUS")) {
			return ChatIntent.GET_BOOKING_STATUS;
		}
		if (upper.contains("INTENT: PAYMENT_HELP")) {
			return ChatIntent.PAYMENT_HELP;
		}
		if (upper.contains("INTENT: REFUND_STATUS")) {
			return ChatIntent.REFUND_STATUS;
		}

		return ChatIntent.UNKNOWN;
	}

	private String extractBookingReference(String message, String history) {
		java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("BB-[A-Z0-9]+", java.util.regex.Pattern.CASE_INSENSITIVE);
		
		// Search in current message
		java.util.regex.Matcher matcher = pattern.matcher(message);
		if (matcher.find()) {
			return matcher.group().toUpperCase();
		}
		
		// Fallback to history
		if (history != null) {
			matcher = pattern.matcher(history);
			String lastMatch = "";
			while (matcher.find()) {
				lastMatch = matcher.group().toUpperCase();
			}
			return lastMatch;
		}
		
		return "";
	}

	private Long extractBookingId(String message, String history) {
		// Only look for standalone numbers (1-9 digits) to avoid picking them out of PNRs
		java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\b(\\d{1,9})\\b");
		
		java.util.regex.Matcher matcher = pattern.matcher(message);
		if (matcher.find()) return Long.parseLong(matcher.group(1));
		
		if (history != null) {
			matcher = pattern.matcher(history);
			// Find the LAST mentioned ID in history
			String lastMatch = "";
			while (matcher.find()) {
				lastMatch = matcher.group(1);
			}
			if (!lastMatch.isEmpty()) return Long.parseLong(lastMatch);
		}
		return 0L;
	}

	private int extractSeatCount(String message, String history) {
		java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+) (?:seat|passenger)", java.util.regex.Pattern.CASE_INSENSITIVE);
		java.util.regex.Matcher matcher = pattern.matcher(message);
		if (matcher.find()) return Integer.parseInt(matcher.group(1));
		
		if (history != null) {
			matcher = pattern.matcher(history);
			int lastMatch = 0;
			while (matcher.find()) lastMatch = Integer.parseInt(matcher.group(1));
			if (lastMatch > 0) return lastMatch;
		}
		
		return 1; // Default
	}

	private void sendChatNotificationEmail(User user, ChatIntent intent, String message) {
		try {
			String intentDesc = getIntentDescription(intent);
			String subject = "Blue Bus Assistant: " + intentDesc;
			String body = buildChatEmailBody(user.getName(), intent, message);
			
			SimpleMailNotification notification = new SimpleMailNotification(user.getEmail(), subject, body);
			sendChatEmail(notification);
			
			log.info("Professional chat notification email sent to {}", user.getEmail());
		} catch (Exception e) {
			log.error("Failed to send chat notification email: {}", e.getMessage());
		}
	}

	private String buildChatEmailBody(String userName, ChatIntent intent, String message) {
		String intentDescription = getIntentDescription(intent);
		
		return "Hello " + userName + ",\n\n"
				+ "This is a notification from Blue Bus Booking Chatbot.\n\n"
				+ "Action: " + intentDescription + "\n"
				+ "Details: " + message + "\n\n"
				+ "If you did not initiate this action, please contact support immediately.\n\n"
				+ "Thank you,\n"
				+ "Blue Bus Booking Team";
	}

	private String getIntentDescription(ChatIntent intent) {
		return switch (intent) {
			case SEARCH_TRIP -> "Trip Search";
			case CANCEL_BOOKING -> "Booking Cancellation";
			case GET_BOOKING_STATUS -> "Booking Status Check";
			case PAYMENT_HELP -> "Payment Assistance";
			case REFUND_STATUS -> "Refund Status Check";
			default -> "Chatbot Interaction";
		};
	}

	private void sendChatEmail(SimpleMailNotification notification) {
		try {
			// Create a simple notification sender
			String subject = notification.subject;
			String body = notification.body;
			String toEmail = notification.email;
			
			log.debug("Preparing to send email to {} with subject: {}", toEmail, subject);
			// Email will be sent asynchronously
			// Using a separate method to avoid direct JavaMailSender dependency
			emailService.sendChatNotificationEmail(toEmail, subject, body);
		} catch (Exception e) {
			log.error("Error sending chat email: {}", e.getMessage());
		}
	}

	// Inner class for simple mail notification
	private static class SimpleMailNotification {
		String email;
		String subject;
		String body;

		SimpleMailNotification(String email, String subject, String body) {
			this.email = email;
			this.subject = subject;
			this.body = body;
		}
	}

	private java.util.Map<String, Object> mapToSafeBooking(Booking booking) {
		java.util.Map<String, Object> map = new java.util.HashMap<>();
		map.put("id", booking.getId());
		map.put("reference", booking.getBookingReference());
		map.put("status", booking.getStatus());
		map.put("amount", booking.getFinalAmount());
		map.put("date", booking.getBookingTime());
		
		if (booking.getTrip() != null && booking.getTrip().getRoute() != null) {
			map.put("source", booking.getTrip().getRoute().getSource());
			map.put("destination", booking.getTrip().getRoute().getDestination());
			map.put("journeyDate", booking.getTrip().getJourneyDate());
			map.put("departureTime", booking.getTrip().getDepartureTime());
		}
		
		return map;
	}

	private String formatBookingsList(List<Booking> bookings) {
		StringBuilder sb = new StringBuilder();
		int count = 0;
		for (Booking b : bookings) {
			if (count++ >= 3) break; // Only show top 3 for brevity
			sb.append("• **PNR:** ").append(b.getBookingReference())
			  .append(" | ").append(b.getTrip().getRoute().getSource())
			  .append(" → ").append(b.getTrip().getRoute().getDestination())
			  .append(" | ").append(b.getStatus()).append("\n");
		}
		return sb.toString();
	}

	private String formatTripsList(List<TripRecommendationDTO> trips) {
		StringBuilder sb = new StringBuilder();
		int count = 0;
		for (TripRecommendationDTO t : trips) {
			if (count++ >= 3) break;
			sb.append("• **Trip #").append(t.getTripId()).append("** | ")
			  .append(t.getBusName()).append(" (").append(t.getBusType()).append(")\n")
			  .append("  Departure: ").append(t.getDepartureTime()).append(" | Price: ₹").append(t.getPrice()).append("\n\n");
		}
		return sb.toString();
	}

}
