# 🏢 Smart Office Reservation System

<div align="center">
  <h3>A modern, intelligent workspace booking platform tailored for agile teams.</h3>
</div>

---

## 📖 Overview

The **Smart Office Reservation System** is a full-stack, state-of-the-art workspace management application. Designed to streamline office desk and meeting room reservations, it simplifies hybrid work environments through intuitive calendars, real-time availability tracking, and rigorous role-based access controls. 

It empowers employees to effortlessly book desks, while giving managers and administrators deep insights into office resource utilization.

---

## ✨ Key Features

- **🔴 Redis Distributed Concurrency:** Production-grade booking engine using **Redisson** for distributed locking. Prevents double-bookings and race conditions in high-traffic environments.
- **⚡ Multi-Layer Caching:** Integrated Spring Cache with Redis to accelerate desk availability checks, AI recommendation results, and performance analytics.
- **✨ AI Smart Suggest:** Intelligent workspace recommendation engine. Leverages a hybrid LLM/Heuristic approach to suggest the perfect desk based on user preferences, team proximity, and historical behavior.
- **🗺️ Interactive Office Map:** Fully dynamic SVG floor plan allowing visual desk selection, real-time availability tracking, and spatial constraint enforcement.
- **📅 Smart Booking Windows:** 
  - **1st-20th Priority Window:** Employees must plan their monthly attendance during the priority window.
  - **Auto-Approval vs Manager-Review:** Reservations submitted after the 20th of the month automatically pivot to a "Pending Approval" status requiring manager verification.
  - **Next-Month Enforcement:** Role-based logic ensures employees focus on the immediate next month for workspace stability.
- **🔒 VIP Desk Protection:** Granular desk-level access control (e.g., specific desks reserved for key personnel like `employee63`, `employee70`, `employee71`).
- **🛡️ Cybersecurity Anomaly Detection:** Real-time AI security engine that tracks user behavior to detect threats like bot attacks, location jumps, and booking abuse, visualized via a dedicated Security Monitor SOC dashboard.
- **🌙 Theming & UI/UX:** Responsive, modern UI enhanced with Framer Motion animations and global Dark/Light modes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **UI Components & Icons:** Lucide React, Framer Motion
- **Data Visualization & Calendars:** Recharts, FullCalendar
- **Networking:** Axios
- **E2E Testing:** Playwright (Page Object Model)

### Backend
- **Core:** Java 17 + Spring Boot 3.2.2
- **Concurrency & Caching:** **Redis + Redisson**
- **Security:** Spring Security + JWT (JSON Web Tokens)
- **Database ORM:** Spring Data JPA
- **Database Engine:** PostgreSQL
- **API Documentation:** Swagger / Springdoc OpenAPI
- **Document Generation:** OpenPDF

---

## 🏗️ Architecture Overview

This project embodies a decoupled client-server architecture:
1. **Frontend (SPA):** A Single Page Application handling routing securely, preserving standard JSON Web Tokens in isolated memory/local storage.
2. **Backend (REST API):** A strictly typed Spring Boot RESTful interface servicing resource-oriented payload manipulation.
3. **In-Memory Store (Redis):** Acts as a distributed lock manager and high-speed cache for volatile state (availability, session-locks, AI scores).

---

## ⚙️ Requirements

Before starting, ensure you have the following installed on your machine:
- **Java 17+**
- **Maven 3.8+**
- **Node.js (v18+) & npm**
- **PostgreSQL (v13+)**
- **Redis (v6+)** (Required for booking concurrency and caching)

---

## 🚀 Installation & Setup

### 1. Services Setup
Ensure both **PostgreSQL** and **Redis** are running on their default ports (5432 and 6379).

### 2. Database Initialization
Create a new database named `smart_office_db` and ensure the role `smart_user` possesses sufficient access to it.

### 3. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend API should now be running cleanly on `http://localhost:8080`.

### 4. Frontend Setup
Open a separate terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend SPA will compile via Vite and be accessible at `http://localhost:5173`.

---

## 🕹️ Usage

Once both environments are running, navigate to `http://localhost:5173` in your browser.

**Default Test Credentials:**
| Role       | Username    | Password   |
|------------|-------------|------------|
| Admin      | `admin`     | `admin123` |
| Manager    | `manager1`  | `manager123`|
| Employee   | `employee1` | `emp123`   |

---

## 🎭 E2E Testing

The project includes a comprehensive end-to-end testing suite powered by **Playwright**.

To run the tests locally:
1. Ensure the backend and frontend are running.
2. Execute the following command in the root directory:
```bash
npx playwright test
```

---

## 🛡️ Security Considerations

- **Stateless Verification:** All secured endpoints require an `Authorization: Bearer <token>` header payload.
- **CORS Protection:** Enforced origin limitation in production prevents cross-origin abuses.
- **Image handling:** Base64 Profile pictures are processed internally to DB text streams to prevent malicious direct execution paths.

---

## 🚀 Future Improvements Roadmap

- [x] Interactive structural office map allowing spatial desk-clicking reservations.
- [x] AI Smart Suggest engine with hybrid heuristic fallback.
- [x] Implement Redis server caching to offload intense analytical operations.
- [x] Implement Push Notifications for reservation approvals.

---

## 🤝 Contribution Guidelines

We highly encourage improvements and optimizations:
1. **Fork** the repository.
2. **Create** your dedicated feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes cleanly.
4. **Push** to the branch.
5. Open a **Pull Request**.

---

## 📄 License

Distributed under the MIT License. Feel free to use, modify, and distribute gracefully.
