# Spring Boot Backend Setup Guide

> **Note:** This backend uses plain text passwords for development/testing purposes only. Do NOT use in production.

## Test Credentials

| Role | Login Field | Password |
|------|-------------|----------|
| Student | Email: `anil@example.com` | `password123` |
| Parent | Email: `ramesh@example.com`, Father: `Ramesh Kumar` | `password123` |
| Admin | Name: `Conductor Raju` | `admin123` |

## PostgreSQL Database Schema

```sql
CREATE TABLE depots (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE routes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    depot_id VARCHAR(50) REFERENCES depots(id),
    coordinates JSONB -- store as [[lat, lng], ...]
);

CREATE TABLE parents (
    id VARCHAR(50) PRIMARY KEY,
    father_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL -- plain text (dev only)
);

CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(150) UNIQUE NOT NULL,
    parent_id VARCHAR(50) REFERENCES parents(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    password VARCHAR(255) NOT NULL -- plain text (dev only)
);

CREATE TABLE admins (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    depot_id VARCHAR(50) REFERENCES depots(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    password VARCHAR(255) NOT NULL -- plain text (dev only)
);

CREATE TABLE bus_passes (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(id),
    route_id VARCHAR(50) REFERENCES routes(id),
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    months INT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'EXPIRED', 'NOT_PURCHASED'))
);

CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    bus_pass_id VARCHAR(50) REFERENCES bus_passes(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL
);
```

## Required REST API Endpoints

### Auth
| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| POST | `/api/auth/login/student` | `{email, password}` | `{token, role, user}` |
| POST | `/api/auth/login/parent` | `{email, password, fatherName}` | `{token, role, user}` |
| POST | `/api/auth/login/admin` | `{name, password}` | `{token, role, user}` |
| POST | `/api/auth/register/student` | `{name, fatherName, email, password, phone}` | `{token, role, user}` |
| POST | `/api/auth/register/admin` | `{name, depotId, routeId, password}` | `{token, role, user}` |

### Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/depots` | List all depots |
| GET | `/api/routes` | List all routes (optional `?depotId=`) |
| GET | `/api/students` | List students (optional `?routeId=` or `?parentId=`) |
| GET | `/api/students/:id` | Get student by ID |
| GET | `/api/parents/:id` | Get parent by ID |
| GET | `/api/bus-passes` | List passes (optional `?studentId=`) |
| POST | `/api/bus-passes` | Apply for pass `{studentId, routeId, months}` |
| PUT | `/api/bus-passes/:id/renew` | Renew pass `{months}` |
| GET | `/api/payments` | List payments (optional `?busPassId=`) |
| POST | `/api/payments` | Make payment `{busPassId, amount}` |
| GET | `/api/config/pass-price` | Get pass price config |

## Spring Boot Dependencies (pom.xml)

```xml
<dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-api</artifactId><version>0.12.3</version></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-impl</artifactId><version>0.12.3</version><scope>runtime</scope></dependency>
    <dependency><groupId>io.jsonwebtoken</groupId><artifactId>jjwt-jackson</artifactId><version>0.12.3</version><scope>runtime</scope></dependency>
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
</dependencies>
```

## Password Authentication (Development Mode)

Passwords are stored and compared as plain text:

```java
// Registration - store password directly
user.setPassword(request.getPassword());

// Login - simple string comparison
if (!request.getPassword().equals(user.getPassword())) {
    throw new RuntimeException("Invalid credentials");
}
```

## application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/smart_bus_pass
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
jwt.secret=your-256-bit-secret-key
jwt.expiration=86400000
```

## CORS Configuration (Required!)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "https://your-lovable-app.lovable.app")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*");
    }
}
```

## Frontend Connection

Set these environment variables in `.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Frontend is configured to use backend APIs directly. Ensure your Spring Boot backend is running on `http://localhost:8080`.
