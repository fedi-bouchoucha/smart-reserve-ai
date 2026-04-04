# 🏢 Smart Office Reservation System

<div align="center">
  <h3>A modern, intelligent workspace booking platform tailored for agile teams.</h3>
</div>

---

## 📖 Overview

The **Smart Office Reservation System** is a full-stack, state-of-the-art workspace management application. Designed to streamline office desk and meeting room reservations, it simplifies hybrid work environments through intuitive calendars, real-time availability tracking, and rigorous role-based access controls. 

It empowers employees to effortlessly book desks, while giving managers and administrators deep insights into office resource utilization.

---

## ✨ Features

- **🔒 Secure Authentication:** JWT-based login with role-based access control (RBAC).
- **👥 Multi-tiered User Roles:**
  - **Admin:** Complete system oversight, user management, and analytics viewing.
  - **Manager:** Team management and reservation oversight.
  - **Employee:** Can intuitively browse, book, and cancel workspace reservations.
- **📅 Interactive Booking Calendar:** Powered by FullCalendar with aesthetic, dynamic event management.
- **📊 Analytics Dashboard:** Visualized utilization mapping and reporting via Recharts.
- **🖼️ Profile Customization:** Personalized accounts, including base64 frictionless profile picture uploads.
- **🌙 Theming & UI/UX:** Responsive, modern UI enhanced with Framer Motion animations and global Dark/Light modes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **UI Components & Icons:** Lucide React, Framer Motion
- **Data Visualization & Calendars:** Recharts, FullCalendar
- **Networking:** Axios

### Backend
- **Core:** Java 17 + Spring Boot 3.2.2
- **Security:** Spring Security + JWT (JSON Web Tokens)
- **Database ORM:** Spring Data JPA
- **Database Engine:** PostgreSQL
- **API Documentation:** Swagger / Springdoc OpenAPI
- **Document Generation:** OpenPDF
- **Utilities:** Lombok

---

## 🏗️ Architecture Overview

This project embodies a decoupled client-server architecture:
1. **Frontend (SPA):** A Single Page Application handling routing securely, preserving standard JSON Web Tokens in isolated memory/local storage to validate requests statelessly.
2. **Backend (REST API):** A strictly typed Spring Boot RESTful interface servicing resource-oriented payload manipulation, secured globally through an internal filter chain validation strategy.

---

## ⚙️ Requirements

Before starting, ensure you have the following installed on your machine:
- **Java 17+**
- **Maven 3.8+**
- **Node.js (v18+) & npm**
- **PostgreSQL (v13+)**

---
---

## 🚀 Installation & Setup

### 1. Database Initialization
Ensure PostgreSQL is running. Create a new database named `smart_office_db` and ensure the role `smart_user` possesses sufficient access to it.

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
The backend API should now be running cleanly on `http://localhost:8080`.

### 3. Frontend Setup
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

## 📚 API Documentation

The backend leverages OpenAPI standards to self-document standard endpoint structures and required HTTP payload definitions.

With the backend active, visit the interactive Swagger UI panel:
👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

---

## 🛡️ Security Considerations

- **Stateless Verification:** All secured endpoints require an `Authorization: Bearer <token>` header payload.
- **CORS Protection:** Enforced origin limitation in production prevents cross-origin abuses.
- **Image handling:** Base64 Profile pictures are processed internally to DB text streams to prevent malicious direct execution paths via physical file storage vulnerabilities.

---

## 🚀 Future Improvements Roadmap

- [ ] Interactive structural office map allowing spatial desk-clicking reservations.
- [ ] Implement Redis server caching to offload intense analytical operations.
- [ ] Advanced end-to-end (E2E) testing routines (e.g., Cypress/Playwright).

---

## 🤝 Contribution Guidelines

We highly encourage improvements and optimizations:
1. **Fork** the repository.
2. **Create** your dedicated feature branch (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes cleanly (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

---

## 📄 License

Distributed under the MIT License. Feel free to use, modify, and distribute gracefully.
