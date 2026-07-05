# ☕ BlueBus — Spring Boot REST API Backend

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://www.oracle.com/java/technologies/downloads/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-4169E1.svg?style=flat-square&logo=postgresql)](https://neon.tech)
[![AI Features](https://img.shields.io/badge/AI%20Features-OpenRouter%20%2F%20GPT--4o--mini-mediumpurple.svg?style=flat-square&logo=openai)](https://openrouter.ai)
[![Payment Gateway](https://img.shields.io/badge/Payment%20Gateway-Razorpay-02042B.svg?style=flat-square&logo=razorpay)](https://razorpay.com)

A robust, enterprise-grade REST API backend powering the BlueBus Platform. Built on Java 21, Spring Boot 3.3.5, and PostgreSQL, this service manages trip scheduling, real-time seat lock transactions, secure payments via Razorpay, user profiles, transactional mailers, and incorporates Spring AI connected to OpenRouter for interactive booking assistance.

---

## 🛠️ Technology Stack

| Component | Library / Framework | Version |
| :--- | :--- | :--- |
| **Framework** | Spring Boot | `3.3.5` |
| **Language** | Java JDK | `21` |
| **Database** | PostgreSQL | `15+` (Hosted on Neon DB) |
| **ORM / JPA** | Spring Data JPA (Hibernate) | Powered by Boot |
| **Security** | Spring Security + JWT | `jjwt 0.12.6` |
| **Payment Gateway**| Razorpay Java SDK | `1.4.7` |
| **AI Connection** | Spring AI (OpenAI Starter) | `1.0.0` (OpenRouter custom base URL) |
| **PDF Generation** | iText PDF | `5.5.13.3` |
| **QR Generation**  | ZXing (Core & JavaSE) | `3.5.3` |

---

## 📡 REST API Endpoints Registry

The base endpoint URL is: `http://localhost:8080/api` (All routes are mapped relative to this path).

### 1. Authentication & Security (Public)
| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account | None |
| `POST` | `/auth/login` | Authenticate credentials & return JWT | None |
| `GET` | `/auth/verify/{token}` | Verify user email address | None |
| `POST` | `/auth/resend-verification` | Resend verify token link | None |

### 2. Authenticated Passenger Actions (JWT Required)
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `PUT` | `/auth/change-password` | Update current user account password | `USER`, `OPERATOR`, `ADMIN` |
| `GET` | `/auth/user-email/{email}` | Retrieve user metadata by email | `USER`, `OPERATOR`, `ADMIN` |
| `PUT` | `/users/{id}` | Update account details (avatar photo URL, phone) | `USER`, `OPERATOR`, `ADMIN` |
| `POST` | `/auth/logout` | Revoke active token (Blacklist database write) | `USER`, `OPERATOR`, `ADMIN` |

### 3. Trips, Schedules, and Seat Booking Operations
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/trips` | Retrieve all scheduled departures | Public |
| `GET` | `/trips/{id}` | Query detailed timeline profile of a trip | Public |
| `GET` | `/trips/search` | Dynamic station, price, date filters | Public |
| `GET` | `/seat-availability/trip/{tripId}` | List real-time occupied/vacant seats | Public |
| `PUT` | `/seat-availability/lock-trip/{tripId}/seat/{seatId}`| Initialize 10-minute temporary seat lock transaction | `USER` |
| `POST` | `/bookings` | Create pending booking record | `USER` |
| `GET` | `/bookings/{id}` | Query specific booking ticket stats | `USER`, `OPERATOR`, `ADMIN` |
| `GET` | `/bookings/user/{userId}` | List reservation history of a passenger | `USER` |
| `PUT` | `/bookings/{id}/cancel` | Cancel reservation and refund seat allocation | `USER`, `OPERATOR`, `ADMIN` |

### 4. Payments Gateways
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/payments/create-order` | Create Razorpay order transaction ID | `USER` |
| `POST` | `/payments/verify` | Validate payment signature returned from gateway | `USER` |
| `GET` | `/payments/{bookingId}` | Fetch status invoice transaction summary | `USER` |

### 5. Chatbot Concierge & AI Recommendations
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/chat/message` | Send message to LLM (BlueBus Concierge) | `USER`, `OPERATOR`, `ADMIN` |
| `GET` | `/recommendations/trips/{userId}`| Smart trip matching recommendation engine | `USER` |
| `GET` | `/recommendations/tours/{userId}`| Tour packages matching engine | `USER` |

### 6. Admin Control Console
| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/buses` | Register new bus to fleet | `ADMIN` |
| `PUT` | `/buses/{id}` | Update bus specs | `ADMIN` |
| `POST` | `/routes` | Register station itineraries | `ADMIN` |
| `POST` | `/trips` | Publish schedules & assign units | `ADMIN`, `OPERATOR` |
| `GET` | `/admin/dashboard/summary` | Query revenue, fleets, user stats | `ADMIN` |
| `GET` | `/admin/dashboard/ai-analytics` | Query LLM search volumes & chatbot stats | `ADMIN` |

---

## 🗄️ Database Entity Schema

The following entities map the relational PostgreSQL schema:
- **User**: Captures names, passwords (BCrypt hashed), verification levels, and email tags.
- **Bus**: Details configuration limits (e.g. 30/36/40 seats), operator references, and models.
- **Seat**: Represents physical seating layouts within a bus.
- **Route**: Maps connection lines from starting points to destinations.
- **Stop**: Represents stops along a Route with sequence ordering.
- **Trip**: Relates a Bus and a Route for a specific date and time, tracking dynamic fares.
- **SeatAvailability**: Manages real-time seat lock state (Locked, Booked, Available) with timestamps.
- **Booking**: Links user details with trip metadata, price aggregates, and confirmation codes.
- **BookingItem**: Connects individual passenger lists to selected Seats.
- **PaymentTransaction**: Logs Razorpay orders, payment signatures, and billing status.
- **ChatMessage**: Stores chatbot messages to manage conversation states.
- **BlacklistedToken**: Holds logged-out JWT hashes.

---

## 🔐 Security Features

1. **JWT Auth Security**: Stateless request authorization via an intercepting filter. Token lifespans are capped at 24 hours.
2. **Password Cryptography**: Credentials are encrypted using the BCrypt algorithm (strength factor: `12`).
3. **Blacklisted Logouts**: Logouts write JWT signatures to a database table. Ingress filters check incoming tokens against this blacklist.
4. **Role-Based Access Control**: Standard method-level validation verifies user access levels: `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasRole('OPERATOR')")`.

---

## 🚀 Local Installation & Execution

### 1. Database Creation
Ensure a PostgreSQL server instance is running. Create a target database:
```sql
CREATE DATABASE blue_bus_booking_db;
```

### 2. Configuration Settings
Edit the application configuration file `src/main/resources/application.properties` and provide connection parameters:
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/blue_bus_booking_db
spring.datasource.username=your_postgres_username
spring.datasource.password=your_postgres_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Razorpay
razorpay.key.id=rzp_test_xxxxxxx
razorpay.key.secret=FuWu7N75xxxxxx

# Spring Mail SMTP
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password

# OpenRouter Spring AI Integration
spring.ai.openai.api-key=sk-or-v1-xxxxxxx
spring.ai.openai.base-url=https://openrouter.ai/api
spring.ai.openai.chat.options.model=openai/gpt-4o-mini
```

### 3. Run Commands
Compile dependencies and boot up the Spring Boot server:
```bash
mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run     # Linux/Mac
```
The server will run on `http://localhost:8080`.

---

## ☁️ AWS Deployment Configuration (EC2 Service)

To configure the compiled JAR to run as a background service on Amazon Linux EC2 instances:

1. **Systemd Service Builder**: Create a file at `/etc/systemd/system/bluebus.service`:
   ```ini
   [Unit]
   Description=BlueBus Engine Service
   After=network.target

   [Service]
   User=ec2-user
   WorkingDirectory=/home/ec2-user
   ExecStart=/usr/bin/java -jar /home/ec2-user/blue-bus-booking-project-0.0.1-SNAPSHOT.jar
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   # Export environment values to prevent properties leakage
   Environment=DB_URL=jdbc:postgresql://your-rds-endpoint:5432/blue_bus_booking_db
   Environment=DB_USERNAME=your_db_username
   Environment=DB_PASSWORD=your_db_password
   Environment=OPENROUTER_API_KEY=your_key
   Environment=RAZORPAY_KEY_ID=your_razorpay_id
   Environment=RAZORPAY_KEY_SECRET=your_razorpay_secret
   Environment=MAIL_USERNAME=your_email
   Environment=MAIL_PASSWORD=your_app_pwd
   Environment=FRONTEND_URL=https://bluebusbooking.vercel.app

   [Install]
   WantedBy=multi-user.target
   ```

2. **Launch Commands**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable bluebus.service
   sudo systemctl start bluebus.service
   sudo systemctl status bluebus.service
   ```
