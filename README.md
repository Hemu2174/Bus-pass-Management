# Smart Bus Pass Hub

Smart Bus Pass Hub is a full-stack web application for managing bus pass operations across Student, Parent, and Admin roles.

It includes:
- A React + Vite frontend with role-based dashboards.
- A Spring Boot + PostgreSQL backend with JWT-based authentication.
- End-to-end pass lifecycle support: apply, renew, and payment tracking.
- Admin-side student management with CRUD operations.

## Highlights

- Role-based sign-in for Student, Parent, and Admin
- Dashboard views for pass status, route details, and renewal actions
- Pass application and renewal flows
- Payment tracking and summaries
- Route and depot mapping support
- JWT authentication for protected APIs
- Admin student CRUD: create, edit, delete, and search/filter users

## Role Capabilities

### Student
- View personal dashboard and pass status
- Apply for a bus pass
- Renew an existing pass

### Parent
- View children pass details
- Track payment and expiry information
- Renew or buy passes for children

### Admin
- Monitor route-level student and pass information
- Manage student records through CRUD controls
- Search and filter users by name, parent, route, and pass status

## Tech Stack

### Frontend
- React 18
- Vite 5
- JavaScript (ES Modules)
- Tailwind CSS
- shadcn/ui + Radix UI
- React Router DOM
- Vitest

### Backend
- Java 17
- Spring Boot 3.2.5
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT (`jjwt`)

## Repository Structure

```text
smart-pass-hub/
├── frontend/            # React + Vite application
│   ├── src/             # Components, pages, hooks, context, API
│   ├── public/          # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/             # Spring Boot application
│   ├── src/main/java/   # Controllers, entities, services, security
│   ├── src/main/resources/ # application.properties, data.sql
│   └── pom.xml
├── render.yaml          # Render.com deployment config
└── .gitignore
```

## Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.9+
- PostgreSQL 14+

## Run Locally

1. Start backend from `backend/`:

```bash
mvn -B spring-boot:run
```

2. Start frontend from `frontend/`:

```bash
npm install
npm run dev
```

3. Open:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080/api`

