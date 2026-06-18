# 🎯 SarrthiIAS – Student Performance Intelligence Portal

A full-stack UPSC coaching platform built with React + Node.js + MongoDB.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-black?logo=socket.io)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)
![Claude AI](https://img.shields.io/badge/AI-Claude%20API-purple)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
- [VS Code](https://code.visualstudio.com)

### Step 1 — Clone the repo
```bash
git clone https://github.com/Shubh-6657/sarrthiias-portal.git
cd sarrthiias-portal
```

### Step 2 — Start MongoDB
```bash
mongod
```
> Keep this terminal running. Open a new terminal tab with **+** for next steps.

### Step 3 — Backend
```bash
cd backend
npm install
node seed.js
npm run dev
```
> Wait for: `🚀 Server running on port 5000`

### Step 4 — Frontend
Open a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```
> Wait for: `➜  Local:   http://localhost:5173/`

### Step 5 — Open Browser
```bash
http://localhost:5173
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sarrthiias.com | Admin@123 |
| **Mentor** | mentor@sarrthiias.com | Mentor@123 |
| **Evaluator** | evaluator@sarrthiias.com | Eval@123 |
| **Student** | student@sarrthiias.com | Student@123 |

> 💡 The login page also has **one-click quick login buttons** for each role.

🌐 **Public page (no login needed):** `http://localhost:5173/readiness`

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (Access + Refresh Tokens), bcryptjs |
| Real-Time | Socket.io |
| AI | Claude API (Anthropic) |
| Styling | Custom CSS (fully responsive) |

---

## ✅ Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | Auth & RBAC | JWT login, refresh tokens, role-based access for 4 roles |
| 2 | Student Management | Create students, track attendance, scores, performance status |
| 3 | Mentor Management | View assigned students, assign tasks with priority |
| 4 | Student Dashboard | View tasks, submit answers, see evaluation history |
| 5 | Evaluation Module | Pending queue, score 0–100, strengths/weaknesses feedback |
| 6 | Admin Dashboard | 6 stat cards + 4 live charts (pie, line, bar, leaderboard) |
| 7 | AI Study Coach | Claude-powered weekly study plans stored in DB |
| 8 | Real-Time Notifications | Socket.io push notifications, no polling |
| 9 | UPSC Readiness Analyzer | Public page, readiness score + AI recommendations |
| 10 | Performance Optimization | Pagination, filtering, search across all list pages |

---

## 📁 Project Structure

sarrthiias-portal/

├── backend/

│   ├── src/

│   │   ├── config/          # DB connection

│   │   ├── controllers/     # Business logic (auth, tasks, evaluations, AI...)

│   │   ├── middleware/      # JWT auth, role guard

│   │   ├── models/          # MongoDB schemas (User, Task, Submission, Evaluation...)

│   │   └── routes/          # All API routes

│   ├── server.js            # Entry point + Socket.io

│   └── seed.js              # Seeds demo users and tasks

├── frontend/

│   ├── src/

│   │   ├── components/      # Layout, sidebar with hamburger menu

│   │   ├── contexts/        # AuthContext, SocketContext

│   │   ├── pages/           # Dashboard, Tasks, Evaluations, Students, AI, Readiness...

│   │   └── services/        # Axios API client with auto token refresh

│   └── vite.config.js

└── README.md

---

## 🔗 Key API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | All roles |
| GET | `/api/tasks` | All roles (filtered by role) |
| POST | `/api/tasks` | Admin, Mentor |
| POST | `/api/submissions` | Student |
| GET | `/api/submissions/pending` | Admin, Evaluator |
| POST | `/api/evaluations` | Admin, Evaluator |
| GET | `/api/admin/stats` | Admin |
| POST | `/api/ai/study-plan` | All roles |
| POST | `/api/ai/readiness` | Public |
| GET | `/api/notifications` | All roles |

---

## 👨‍💻 Author

**Shubh Agrahari** — [@Shubh-6657](https://github.com/Shubh-6657)
