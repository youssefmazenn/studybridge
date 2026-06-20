# StudyBridge

Student companion platform for the course **Enterprise Web Development**.

## Repository layout

- `backend/` — Spring Boot 3, Java 21, JWT + Basic login, H2/PostgreSQL, REST API
- `frontend/` — React, Vite, TypeScript, Tailwind CSS
- `backend/docs/` — milestone documentation ([M1 auth](backend/docs/MILESTONE1_AUTHENTICATION.md), [M2 features](backend/docs/MILESTONE2_BASE_FEATURES.md))

## Prerequisites

- **Backend:** JDK 21+, Maven 3.9+ (or use your IDE’s Maven integration)
- **Frontend:** Node.js 20+ and npm

## Run the backend

```bash
cd backend
mvn spring-boot:run
```

API base URL: `http://localhost:8080`

- H2 console (dev): `http://localhost:8080/h2-console`  
  JDBC URL: `jdbc:h2:mem:studybridge`, user `sa`, empty password.

### Configuration

See `backend/src/main/resources/application.properties`.

- **JWT secret:** set `JWT_SECRET` in production (at least 32 bytes for HS256). For local dev, a default placeholder is used.
- **Token lifetime:** `JWT_EXPIRATION_MS` (default 24h).
- **CORS:** `CORS_ORIGINS` (default `http://localhost:5173`).

### PostgreSQL profile

The default profile is `dev` and uses in-memory H2. To run against PostgreSQL locally:

```bash
docker compose up -d postgres
cd backend
SPRING_PROFILES_ACTIVE=prod mvn spring-boot:run
```

Production database variables:

- `DATABASE_URL` (default `jdbc:postgresql://localhost:5432/studybridge`)
- `DATABASE_USERNAME` (default `studybridge`)
- `DATABASE_PASSWORD` (default `studybridge`)
- `JPA_DDL_AUTO` (default `update`)

### Email reminders

Email sending is disabled by default. Enable it with SMTP settings:

```bash
REMINDER_EMAIL_ENABLED=true \
REMINDER_EMAIL_FROM=no-reply@example.com \
MAIL_HOST=smtp.example.com \
MAIL_PORT=587 \
MAIL_USERNAME=your-user \
MAIL_PASSWORD=your-password \
SPRING_PROFILES_ACTIVE=prod \
mvn spring-boot:run
```

The scheduler checks due, unsent reminders every `REMINDER_EMAIL_POLL_MS` milliseconds and marks a reminder as sent after the email is accepted by the mail server.

## Run the frontend

```bash
cd frontend
cp .env.example .env   # optional; defaults match local backend
npm install
npm run dev
```

App: `http://localhost:5173`

The JWT is kept **only in React state** (auth context), not in `localStorage`.

## Milestone 1 authentication flow

Full assignment-to-implementation mapping, workflows (Mermaid), and file references: **[backend/docs/MILESTONE1_AUTHENTICATION.md](backend/docs/MILESTONE1_AUTHENTICATION.md)** (English: [MILESTONE1_AUTHENTICATION_EN.md](backend/docs/MILESTONE1_AUTHENTICATION_EN.md)).

1. **Register:** `POST /api/v1/auth/register` with JSON body (name, email, password, preferredLanguage). Password is stored as a BCrypt hash.
2. **Login:** `GET /api/v1/auth/login` with header `Authorization: Basic base64(email:password)`.
3. **Response:** JSON with `accessToken`, `tokenType: "Bearer"`, and `user` (no password fields).
4. **Protected calls:** `Authorization: Bearer <accessToken>` (e.g. `GET /api/v1/users/me`).

## Milestone 2 base features

Documentation (requirements mapping, ER diagram, all REST endpoints, frontend routes, tests): **[backend/docs/MILESTONE2_BASE_FEATURES.md](backend/docs/MILESTONE2_BASE_FEATURES.md)** (English: [MILESTONE2_BASE_FEATURES_EN.md](backend/docs/MILESTONE2_BASE_FEATURES_EN.md)).

**Implemented (solo team):**

| Entity | Backend CRUD | Frontend |
|--------|--------------|----------|
| User (M1) | Register, login, profile | Login, register, auth context |
| **Course** | `/api/v1/courses` | `/courses` |
| **Assignment** | `/api/v1/assignments` | `/assignments` |
| **Reminder** | `/api/v1/reminders`, nested under assignments | Per-assignment on assignments page + dashboard “due” banner |

**UI:** Sidebar layout (`AppLayout`), **dashboard** with live stats, upcoming deadlines, course overview, assignment calendar widget.

**After backend code changes:** restart `mvn spring-boot:run` so H2 recreates tables (`ddl-auto=create-drop`).

## Example API requests

**Register**

```http
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "name": "Youssef Salem",
  "email": "test@example.com",
  "password": "password123",
  "preferredLanguage": "English"
}
```

**Login (Basic auth)**

```http
GET http://localhost:8080/api/v1/auth/login
Authorization: Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==
```

(`dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==` is `test@example.com:password123` in Base64.)

**Current user**

```http
GET http://localhost:8080/api/v1/users/me
Authorization: Bearer <paste accessToken here>
```

## Example test user

Use the register request above once, then log in with `test@example.com` / `password123`.

## Connecting Figma to code

There is no official one-click “sync Figma → React” in the way IDEs sync Git. Typical workflows:

- **Inspect in Dev Mode:** copy spacing, colors, and typography into Tailwind classes (what we did for the login card).
- **Plugins:** tools like *Anima*, *Locofy*, or *Builder.io* can export layouts to React; you still review and simplify the output for a course project.
- **Design tokens:** export color and type styles from Figma and map them to Tailwind theme extensions in `frontend` when you want pixel-consistent branding.

For Milestone 1, the login screen is a Tailwind implementation of a centered SaaS card (blue / white / light gray). You can refine it to match your file frame-by-frame after the auth flow is stable.

## Manual tests

**Milestone 1**

- Register a new user; repeat with the same email → clear error (duplicate).
- Register with invalid payload (e.g. short password) → validation error JSON from the backend.
- Log in with correct Basic credentials → receive JWT and user object.
- Log in with wrong password → 401-style error, friendly message on the frontend.
- Open `/dashboard` without logging in → redirect to `/login`.
- Sign out → token cleared from memory; `/dashboard` redirects to login again.
- Call `/api/v1/users/me` without `Authorization` (e.g. curl) → 401 JSON.

**Milestone 2**

- Create, edit, delete courses (instructor optional).
- Create assignments linked to a course; mark complete; edit; delete.
- Add reminders (presets or custom time); dismiss on dashboard when due.
- Dashboard counts and lists match your data.
- Run backend tests: `cd backend && mvn test`
