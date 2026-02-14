## Smart Office Reservation System — Walkthrough
## Project Structure
Backend: Spring Boot (Java 17) + PostgreSQL + Swagger
Frontend: React + Vite
Access Points
Frontend App: http://localhost:5173
Backend API: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui/index.html

Database Configuration (PostgreSQL)
URL: jdbc:postgresql://localhost:5432/smart_office_db
User: smart_user
Password: trytoguessit12345
Login Credentials
Role	Username	Password
Admin	admin	admin123
Manager	manager1	manager123
Employee	employee1	emp123

## How to Run
cd backend && mvn spring-boot:run
cd frontend && npm run dev