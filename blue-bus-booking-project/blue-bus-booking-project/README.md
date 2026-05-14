# Blue Bus Booking Project

A comprehensive Spring Boot REST API for managing online bus ticket booking operations, including trip management, seat availability, booking operations, and user authentication with AI-powered features.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [API Response Format](#api-response-format)
- [Database Schema](#database-schema)
- [Security](#security)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Project Overview

The Blue Bus Booking Project is a full-featured backend application designed to manage online bus ticket booking. It handles bus operations management, route management, trip scheduling, real-time seat availability, booking operations, and user management with JWT-based authentication and AI-powered recommendations.

**Key Capabilities:**
- Multi-user booking platform
- Real-time seat availability tracking
- Payment processing (Razorpay integration)
- AI-powered chatbot and recommendations
- Email notifications
- Comprehensive reporting and analytics

## ✨ Features

### Core Features
- **User Management** - Registration, login, profile management, password change
- **Authentication & Authorization** - JWT-based authentication with token blacklisting
- **Bus & Operator Management** - Manage bus details, operators, and their operations
- **Route Management** - Define and manage bus routes with stops
- **Trip Management** - Schedule and manage bus trips with pricing and availability
- **Booking System** - Create, confirm, and cancel bookings with multi-passenger support
- **Seat Management** - Dynamic seat allocation and real-time availability tracking
- **Payment Integration** - Razorpay payment gateway for secure transactions
- **Email Notifications** - Automated email notifications for bookings and updates

### Advanced Features
- **AI-Powered Chatbot** - Natural language chat interface for booking assistance
- **Smart Search** - AI-driven trip search using natural language processing
- **Seat Preferences** - AI learns user preferences and suggests optimal seats
- **Recommendation Engine** - Personalized trip recommendations based on behavior
- **Dynamic Pricing** - Intelligent pricing based on demand and availability
- **Advanced Filters** - Search trips by date, price range, departure time, bus type

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Spring Boot 3.3.5 |
| **Language** | Java 21 |
| **Database** | MySQL 5.7+ |
| **ORM** | Spring Data JPA / Hibernate |
| **Build Tool** | Maven 3.6+ |
| **Security** | Spring Security + JWT (JJWT 0.12.6) |
| **Validation** | Jakarta Bean Validation |
| **Code Generation** | Lombok |
| **Payment Gateway** | Razorpay Java SDK 1.4.7 |
| **Email Service** | Spring Boot Mail |
| **AI & LLM** | Spring AI + Ollama (Mistral) |

## 📦 Prerequisites

Before running the application, ensure you have:

- **Java 21** or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **MySQL Server 5.7+** ([Download](https://dev.mysql.com/downloads/mysql/))
- **Maven 3.6+** (or use the bundled Maven wrapper)

### Verify Installation
```bash
java -version
mysql --version
mvn --version
```

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd blue-bus-booking-project

# 2. Create MySQL database
mysql -u root -p
CREATE DATABASE bluebusbooking;
EXIT;

# 3. Configure application.properties
# Edit: src/main/resources/application.properties
# Update database credentials and external service settings

# 4. Run the application
mvnw.cmd spring-boot:run  # Windows
./mvnw spring-boot:run    # Linux/Mac

# 5. Access API at http://localhost:8080/api
```

## 🚀 Installation & Setup

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd blue-bus-booking-project
```

### Step 2: Create MySQL Database
```bash
mysql -u root -p
CREATE DATABASE bluebusbooking;
USE bluebusbooking;
```

### Step 3: Configure Application
Edit `src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/bluebusbooking
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# Razorpay Payment
razorpay.key.id=your_razorpay_key
razorpay.key.secret=your_razorpay_secret

# Email (SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# AI/Ollama
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.model.name=mistral
```

### Step 4: Build & Run
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

Application runs on `http://localhost:8080`

## ⚙️ Configuration

### Key Properties

**Database Configuration:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bluebusbooking
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

**JWT Configuration:**
- Secret Key: Configured in `JwtUtil.java`
- Expiration: 24 hours
- Algorithm: HS256 (HMAC with SHA-256)

**Payment Gateway (Razorpay):**
```properties
razorpay.key.id=your_key_id
razorpay.key.secret=your_key_secret
```

**Email Service:**
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email
spring.mail.password=your_app_password
```

**AI Features (Ollama):**
```properties
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.model.name=mistral
```

## ▶️ Running the Application

### Using Maven Wrapper

**Windows:**
```bash
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
./mvnw spring-boot:run
```

### Build and Run JAR

```bash
mvn clean package
java -jar target/blue-bus-booking-project-0.0.1-SNAPSHOT.jar
```

Application runs on `http://localhost:8080` by default.

## 📁 Project Structure

```
blue-bus-booking-project/
├── src/
│   ├── main/
│   │   ├── java/com/bluebus/booking/
│   │   │   ├── BlueBusBookingProjectApplication.java
│   │   │   ├── controller/              # REST API Controllers
│   │   │   ├── service/                 # Service interfaces
│   │   │   ├── serviceImpl/              # Service implementations
│   │   │   ├── entity/                  # JPA Entity classes
│   │   │   ├── dto/                     # Data Transfer Objects
│   │   │   ├── repository/              # Spring Data JPA Repositories
│   │   │   ├── security/                # Security & JWT configuration
│   │   │   ├── exception/               # Custom exceptions
│   │   │   ├── config/                  # Application configuration
│   │   │   └── scheduler/               # Scheduled tasks
│   │   └── resources/
│   │       ├── application.properties   # Configuration file
│   │       └── static/
│   └── test/                            # Test classes
├── pom.xml                              # Maven configuration
└── README.md                            # This file
```

## 📡 API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login (get JWT token) |
| POST | `/auth/logout` | Logout (blacklist token) |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/{id}` | Get user profile |
| PUT | `/users/{id}` | Update profile |
| PUT | `/users/{id}/change-password` | Change password |

### Bus Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/buses` | List all buses |
| GET | `/buses/{id}` | Get bus details |
| POST | `/buses` | Create bus (Admin) |
| PUT | `/buses/{id}` | Update bus (Admin) |

### Route Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | List all routes |
| GET | `/routes/{id}` | Get route details |
| POST | `/routes` | Create route (Admin) |

### Trip Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List all trips |
| GET | `/trips/{id}` | Get trip details |
| GET | `/trips/search` | Search trips with filters |
| POST | `/trips` | Create trip (Admin) |

### Seat & Availability Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/seat-availability/trip/{tripId}` | Get seat availability |
| PUT | `/seat-availability/lock-trip/{tripId}/seat/{seatId}` | Lock seat |
| PUT | `/seat-availability/confirm-trip/{tripId}/seat/{seatId}` | Confirm seat |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create booking |
| GET | `/bookings/{id}` | Get booking details |
| GET | `/bookings/user/{userId}` | Get user's bookings |
| PUT | `/bookings/{id}/confirm` | Confirm booking |
| PUT | `/bookings/{id}/cancel` | Cancel booking |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-order` | Create payment order |
| POST | `/payments/verify` | Verify payment |
| GET | `/payments/{bookingId}` | Get payment details |

### AI & Chatbot Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/chat/message` | Send message to AI chatbot |

### Recommendation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/trips/{userId}` | Get trip recommendations |
| GET | `/recommendations/tours/{userId}` | Get tour recommendations |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard/summary` | Dashboard metrics |
| GET | `/admin/dashboard/ai-analytics` | AI analytics |

## 🌐 API Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "data": null
}
```

## 🗄️ Database Schema

### Core Entities

**Users & Authentication**
- **User** - User accounts and profiles
- **BlacklistedToken** - Logout token blacklist

**Bus Operations**
- **Bus** - Bus details and specifications
- **BusOperator** - Bus company information
- **Route** - Bus routes
- **Stop** - Individual stops on routes

**Booking Management**
- **Trip** - Scheduled bus trips
- **Booking** - Customer bookings
- **BookingItem** - Individual passenger allocations
- **Seat** - Seat information
- **SeatAvailability** - Real-time availability tracking

**AI & Features**
- **ChatMessage** - Chat history
- **SeatPreference** - User preferences
- **PaymentTransaction** - Payment records

### Entity Relationships
```
User → Booking → BookingItem → Seat (in Trip)
User → SeatPreference
User → ChatMessage
Bus → Seat
Bus → Trip
Trip → SeatAvailability
BusOperator → Bus
Route → Stop
Trip → Booking
```

## 🔐 Security

### Authentication & Authorization

- **JWT Token Authentication** - Secure token-based auth
- **Password Encryption** - BCrypt hashing (strength 12)
- **Token Blacklisting** - Logout via token blacklist
- **CORS Configuration** - Cross-origin request handling
- **Role-Based Access Control** - Admin, User roles
- **Stateless Session** - JWT-based state management

### Endpoint Protection

**Public Endpoints:**
- `/api/auth/**` - Authentication
- `/api/trips/**` - Trip listings
- `/api/buses/**` - Bus information
- `/api/routes/**` - Route information
- `/api/stops/**` - Stop information

**Authenticated Endpoints:**
- `/api/bookings/**` - Booking operations
- `/api/users/**` - User management
- `/api/payments/**` - Payment operations
- `/api/ai/**` - AI features
- `/api/recommendations/**` - Recommendations
- `/api/invoice/**` - Invoice generation
- `/api/coupons/**` - Coupon management

**Admin Only:**
- `/api/admin/**` - Administrative operations

### JWT Token

Send in Authorization header:
```
Authorization: Bearer <jwt_token>
```

**Token Details:**
- Algorithm: HS256
- Expiration: 24 hours
- Contains: Email (subject), issued-at, expiration

## 💻 Development

### Building the Project

```bash
mvn clean install
```

### Running Tests

```bash
mvn test
```

### Code Style

- Follow standard Java naming conventions
- Use meaningful variable and method names
- Write clear comments for complex logic
- Keep methods small and focused

### IDE Setup

**IntelliJ IDEA / Eclipse:**
1. Install Lombok plugin
2. Enable annotation processing
3. Set Java 21 as project SDK

**Visual Studio Code:**
1. Install Extension Pack for Java
2. Install Lombok Annotations Support

### Debug Mode

Enable in `application.properties`:
```properties
logging.level.root=INFO
logging.level.com.bluebus.booking=DEBUG
spring.jpa.show-sql=true
```

## 🐛 Troubleshooting

### Issue: "Connection refused: localhost:3306"
**Solution:** Ensure MySQL server is running
```bash
# Windows
net start MySQL

# Linux/Mac
brew services start mysql-community-server
```

### Issue: "Failed to bind port 8080"
**Solution:** Port is in use. Change in `application.properties`:
```properties
server.port=8081
```

### Issue: "Ollama connection refused"
**Solution:** Ensure Ollama server is running
```bash
ollama serve
```

### Issue: "Model not found in Ollama"
**Solution:** Pull the model first
```bash
ollama pull mistral
```

## 🤝 Contributing

### Guidelines

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing code style

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add brief description of changes"
   ```

4. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Review

- Ensure all tests pass
- Add tests for new features
- Update documentation as needed

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring AI Documentation](https://spring.io/projects/spring-ai)
- [Ollama Documentation](https://ollama.ai/docs)
- [Razorpay API Documentation](https://razorpay.com/docs/api/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

## 📞 Support & Contact

For issues or questions:
1. Check the Troubleshooting section above
2. Review code comments and documentation
3. Ensure all prerequisites are installed
4. Check application logs in `target/` directory

---

## 📋 Project Metadata

| Property | Value |
|----------|-------|
| **Name** | Blue Bus Booking Project |
| **Version** | 1.2.0-RELEASE |
| **Java Version** | 21 |
| **Spring Boot Version** | 3.3.5 |
| **Build Tool** | Maven 3.6+ |
| **Status** | Production Ready |
| **License** | Proprietary |

---

**Questions?** Refer to the documentation sections above or check the code comments for implementation details.
