# 🚌 BlueBus — Full-Stack AI-Powered Bus Booking Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=flat-square&logo=openjdk)](https://www.oracle.com/java/technologies/downloads/)
[![React](https://img.shields.io/badge/React-19.2.5-blue.svg?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0.10-purple.svg?style=flat-square&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.2.4-38B2AC.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-4169E1.svg?style=flat-square&logo=postgresql)](https://neon.tech)
[![AI Features](https://img.shields.io/badge/AI%20Features-OpenRouter%20%2F%20GPT--4o--mini-mediumpurple.svg?style=flat-square&logo=openai)](https://openrouter.ai)
[![Payment Gateway](https://img.shields.io/badge/Payment%20Gateway-Razorpay-02042B.svg?style=flat-square&logo=razorpay)](https://razorpay.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An enterprise-grade, high-performance online bus booking platform combining a modern React SPA (Vite + Tailwind CSS v4) with a secure, robust Spring Boot REST API. Features real-time seat locks, dynamic fare calculations, integrated Razorpay payment gateway, automated PDF invoice/ticket generation, and an intelligent AI Concierge for route planning and personalized seat recommendations.

🔴 **[Explore Live Demo](https://bluebusbooking.vercel.app/)** • 🖥️ **[Frontend Documentation](file:///c:/Users/itspa/FirstBitSolutions/Blue-Bus-Booking-Project/Front-End/blue-bus-booking/README.md)** • ☕ **[Backend Documentation](file:///c:/Users/itspa/FirstBitSolutions/Blue-Bus-Booking-Project/blue-bus-booking-project/README.md)**

---

## 📁 Sub-Project Repository Mapping

The project consists of two distinct components, which can be deployed and maintained as separate repositories:

```
Blue-Bus-Booking-Project/
├── 📁 docs/screenshots/               --> Root repository screenshot assets
├── 📁 Front-End/blue-bus-booking/     --> React + Vite Client-side Application (Self-contained screenshots in Front-End/blue-bus-booking/docs/screenshots/)
└── 📁 blue-bus-booking-project/        --> Spring Boot + PostgreSQL REST API Backend
```

---

## 🧠 System Architecture

The following diagram illustrates the data flow, security model, and external service integrations:

```mermaid
graph TD
    %% Frontend Layer
    subgraph Client ["Client Layer (React SPA)"]
        SPA["React 19 + Vite 8 Client"]
        TW["Tailwind CSS v4 Engine"]
        LM["Leaflet Interactive Maps"]
        SPA --> TW
        SPA --> LM
    end

    %% Security & Gateway
    subgraph API ["Gateway & Security (Spring Security)"]
        Filter["JWT Filter & Token Blacklisting"]
        RBAC["Role-Based Access Control (Admin / Operator / User)"]
        Filter --> RBAC
    end

    %% Backend Service Layer
    subgraph Services ["Backend Core (Spring Boot 3.3.5)"]
        AuthSvc["Auth Service"]
        BusSvc["Bus & Route Scheduler"]
        BookSvc["Seat Lock & Booking Engine"]
        PaySvc["Razorpay Payment Service"]
        PdfSvc["iText Invoice Generator"]
        AISvc["Spring AI (OpenRouter Connection)"]
    end

    %% Storage & Database Layer
    subgraph Data ["Data Layer"]
        DB[(Neon PostgreSQL Database)]
    end

    %% External Systems
    subgraph External ["External Services"]
        OR["OpenRouter API (GPT-4o-mini)"]
        RZ["Razorpay Payment Gateway"]
        SMTP["Gmail SMTP Mail Service"]
    end

    %% Flows
    SPA -->|HTTPS + JWT| Filter
    RBAC --> AuthSvc
    RBAC --> BusSvc
    RBAC --> BookSvc
    RBAC --> PaySvc
    RBAC --> PdfSvc
    RBAC --> AISvc

    AuthSvc --> DB
    BusSvc --> DB
    BookSvc --> DB
    PaySvc --> DB
    PdfSvc --> DB
    AISvc --> DB

    AISvc <-->|Chat & Recommendations| OR
    PaySvc <-->|Verify Order| RZ
    BookSvc -->|Confirm Booking Alert| SMTP
```

---

## 📸 Interactive Visual Walkthrough

> [!NOTE]
> Save screenshot assets in the root `docs/screenshots/` folder to populate this gallery on the root project page.

### 1. Customer Booking Experience

<table>
  <tr>
    <td width="50%">
      <h4>A. Home Landing Page</h4>
      <img src="docs/screenshots/landing_page.png" alt="BlueBus Landing Page" width="100%"/>
      <p>Clean, high-performance landing page displaying search forms for origin, destination, and departure dates with direct navigation options to operators and active promotional offers.</p>
    </td>
    <td width="50%">
      <h4>B. Intelligent AI Search</h4>
      <img src="docs/screenshots/ai_search.png" alt="AI Search and Matching" width="100%"/>
      <p>Natural language search bar. Searches such as <i>"pune to goa"</i> query our AI engine to identify optimal departures, highlighting them with badges like <b>100% Match</b>.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>C. Route Itinerary & Seat Selector</h4>
      <img src="docs/screenshots/seat_selection.png" alt="Route Details & Seat Layout" width="100%"/>
      <p>Interactive bus seat deck mapping (Upper & Lower deck) with real-time seat locks and AI-suggested preferences (e.g. suggesting an <b>Aisle</b> seat based on past journeys).</p>
    </td>
    <td width="50%">
      <h4>D. Journey Route Map Details</h4>
      <img src="docs/screenshots/route_explorer.png" alt="Interactive Route Explorer Map" width="100%"/>
      <p>An interactive map modal displaying the path from starting point to destination using leaflet maps, showing stops (e.g., Satara Bypass, Kolhapur Bus Stand) and specific stop timings.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>E. Unified Checkout & Coupon Code</h4>
      <img src="docs/screenshots/checkout.png" alt="Checkout Page" width="100%"/>
      <p>Consolidated booking drawer capturing passenger information, interactive payment options (UPI, Netbanking, Cards, Cash), and active coupon selector.</p>
    </td>
    <td width="50%">
      <h4>F. Razorpay Gateway Verification</h4>
      <img src="docs/screenshots/payment_success.png" alt="Razorpay Payment Verification" width="100%"/>
      <p>Embedded Razorpay payment verification popup confirming the capture of booking charges securely.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>G. Confirmed Tickets & QR Scans</h4>
      <img src="docs/screenshots/booking_confirmed.png" alt="Booking Confirmation Ticket" width="100%"/>
      <p>Successful confirmation screen displaying QR codes for boarding, PDF download triggers, and comprehensive trip statistics.</p>
    </td>
    <td width="50%">
      <h4>H. User Bookings Repository</h4>
      <img src="docs/screenshots/user_bookings.png" alt="My Bookings Panel" width="100%"/>
      <p>Personal profile section where users can view history, trace booking statuses (Confirmed/Cancelled), print invoices, or request cancellations.</p>
    </td>
  </tr>
  <tr>
    <td width="100%" colspan="2">
      <h4>I. BlueBus AI Concierge (Chat Assistant)</h4>
      <p align="center">
        <img src="docs/screenshots/ai_chatbot.png" alt="AI Chatbot Concierge" width="50%"/>
      </p>
      <p align="center">Chatbot widget providing passenger assistance for checking schedules, booking trips, retrieving status details, or processing cancellations using natural language conversations.</p>
    </td>
  </tr>
</table>

### 2. Admin & Operator Management Consoles

<table>
  <tr>
    <td width="50%">
      <h4>A. Main Admin Dashboard</h4>
      <img src="docs/screenshots/admin_dashboard.png" alt="Admin Dashboard Overview" width="100%"/>
      <p>Comprehensive system health metrics showing gross revenue, active users, booking counts, fleet size, and AI chatbot session analytics.</p>
    </td>
    <td width="50%">
      <h4>B. Strategic Fleet Partners</h4>
      <img src="docs/screenshots/partners_mgmt.png" alt="Partners Management" width="100%"/>
      <p>Operator registry control deck where admins onboard and manage fleet operator accounts (VRL Travels, KSRTC, Orange Travels, Neeta Travels).</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>C. Routes & Schedules Architect</h4>
      <img src="docs/screenshots/schedules_routes.png" alt="Schedules and Routes Management" width="100%"/>
      <p>Route sequence builders allowing administrators to map station stop orders, estimate distances, configure trip timings, and schedule buses.</p>
    </td>
    <td width="50%">
      <h4>D. System Maintenance & Seat-Lock Purge</h4>
      <img src="docs/screenshots/maintenance.png" alt="System Maintenance Portal" width="100%"/>
      <p>System tools to release expired 10-minute hold seat locks, reset database configurations, and display general service health status.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>E. Operator Dashboard Summary</h4>
      <img src="docs/screenshots/operator_dashboard.png" alt="Operator Dashboard Summary" width="100%"/>
      <p>Operator-specific analytics panel displaying total earnings, active units, passenger occupancies, and monthly sales distributions.</p>
    </td>
    <td width="50%">
      <h4>F. Operator Financial Earnings</h4>
      <img src="docs/screenshots/operator_earnings.png" alt="Operator Financial Earnings" width="100%"/>
      <p>Visual charts dissecting revenue booking channels (Web Portal vs. Mobile Application) and total yield progress.</p>
    </td>
  </tr>
</table>

---

## ⚡ Quick Start (Local Setup)

### 1. Prerequisites
- **Java JDK 21** or higher
- **Node.js** v18+ (with npm)
- **PostgreSQL Database** (Local instance or Neon Cloud instance)
- **OpenRouter API Key** (for chatbot AI operations)

### 2. Database Creation
Create a new database named `blue_bus_booking_db` in PostgreSQL:
```sql
CREATE DATABASE blue_bus_booking_db;
```

### 3. Backend Execution
1. Navigate to the backend directory:
   ```bash
   cd blue-bus-booking-project
   ```
2. Configure environmental variables in `src/main/resources/application.properties` (or export them):
   ```properties
   DB_URL=jdbc:postgresql://localhost:5432/blue_bus_booking_db
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   OPENROUTER_API_KEY=your_openrouter_api_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```
3. Boot up the Spring Boot application using Maven:
   ```bash
   mvnw.cmd spring-boot:run   # Windows
   ./mvnw spring-boot:run     # Linux/Mac
   ```

### 4. Frontend Execution
1. Navigate to the frontend directory:
   ```bash
   cd Front-End/blue-bus-booking
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the client-side server locally:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
