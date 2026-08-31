# 🚀 NextStep AI

An AI-powered career development platform that helps users improve their professional profiles, analyze resumes, compare resumes against job descriptions, and receive AI-powered career guidance.

---

## ✨ Features

### 📊 Profile Analysis
- GitHub profile analysis
- LinkedIn profile analysis
- Resume analysis
- Overall scoring and feedback
- Personalized improvement suggestions

### 🎯 Resume vs Job Description Matching
- Upload resume and job description
- Match score generation
- Missing skills identification
- Missing keyword detection
- Actionable recommendations

### 🤖 AI Career Assistant
- Career guidance
- Coding assistance
- Profile improvement suggestions
- Chat history support

### 🔐 Authentication & Security
- JWT authentication
- Google OAuth login
- Email OTP verification
- Password reset functionality
- Account deletion verification

### 👤 User Dashboard
- Token management
- Profile management
- Analysis history
- Monthly token limits

---

# 🛠 Tech Stack

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React

## Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication
- Maven

## Database
- PostgreSQL

## AI Services
- Google Gemini API

## Authentication
- JWT
- Google OAuth

---

# 📂 Project Structure

```text
NEXTSTEP-AI
│
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
│
├── backend
│   └── nextstep
│       ├── src
│       ├── pom.xml
│       └── target
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/sujalpapalkar/NEXTSTEP-AI.git

cd NEXTSTEP-AI
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Backend Setup

```bash
cd backend/nextstep

mvn clean install

mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

# 🔑 Environment Variables

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

---

## Backend (application.yml)

```yaml
spring:
  datasource:
    url: YOUR_DATABASE_URL
    username: YOUR_DB_USERNAME
    password: YOUR_DB_PASSWORD

app:
  jwt:
    secret: YOUR_JWT_SECRET

gemini:
  api-key: YOUR_GEMINI_API_KEY

google:
  client-id: YOUR_GOOGLE_CLIENT_ID
```

---

# 📌 Main APIs

## Authentication

```http
POST /api/auth/login
POST /api/auth/google
POST /api/auth/send-signup-otp
POST /api/auth/verify-signup-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Profile Analysis

```http
POST /api/profile/github
POST /api/profile/linkedin
POST /api/profile/resume
POST /api/profile/submit-all
```

## JD Matching

```http
POST /api/jd-match/analyze-text
POST /api/jd-match/analyze-file
GET  /api/jd-match
GET  /api/jd-match/{id}
```

## AI Chatbot

```http
POST /api/chat
GET  /api/chat/history
```

## User

```http
GET /api/user/profile
PUT /api/user/profile
GET /api/user/tokens
GET /api/user/tokens/refresh
```

---

# 🔮 Future Enhancements

- Subscription Plans
- Resume Builder
- Interview Preparation Module
- Analytics Dashboard
- Admin Panel
- AI Mock Interviews
- RAG-based Career Assistant

