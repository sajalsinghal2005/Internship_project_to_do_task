# 🚀 TaskFlow — Full Stack Project Management App

> A real-time, full-stack project management platform built for the Full Stack Developer Internship Round 2 Assignment.

![TaskFlow Banner](https://via.placeholder.com/1200x400/0f172a/38bdf8?text=TaskFlow+%E2%80%94+Project+Management+Reimagined)

---

## 📌 Overview

**TaskFlow** is a production-grade task and project management web application inspired by Trello/Asana. It features real user authentication, a RESTful backend API, MongoDB database integration, and is fully deployable to the cloud.

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| **Frontend** | React 18, Vite, Tailwind CSS        |
| **Backend**  | Node.js, Express.js                 |
| **Database** | MongoDB Atlas + Mongoose            |
| **Auth**     | JWT (JSON Web Tokens) + bcryptjs    |
| **Deploy**   | Vercel (Frontend) + Render (Backend)|

---

## ✨ Features

- 🔐 **Real Authentication** — Signup/Login with JWT + hashed passwords (bcrypt)
- 📋 **Kanban Board** — Drag-and-drop tasks across Todo / In Progress / Done columns
- ✅ **Full CRUD** — Create, Read, Update, Delete tasks
- 🏷️ **Priority Levels** — Low / Medium / High with color coding
- 📅 **Due Dates** — Set and track deadlines
- 👤 **User Profiles** — Personal dashboard per user
- 🔒 **Protected Routes** — Authenticated-only pages
- 📱 **Responsive Design** — Mobile-first UI

---

## 📁 Project Structure

```
taskflow/
├── README.md
├── backend/                    # Express + MongoDB API
│   ├── server.js               # Entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema
│   │   └── Task.js             # Task schema
│   ├── routes/
│   │   ├── auth.js             # /api/auth routes
│   │   └── tasks.js            # /api/tasks routes
│   └── middleware/
│       └── auth.js             # JWT verification middleware
│
└── frontend/                   # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── axios.js        # Axios instance + interceptors
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        └── components/
            ├── Navbar.jsx
            ├── TaskCard.jsx
            ├── TaskModal.jsx
            ├── KanbanColumn.jsx
            └── ProtectedRoute.jsx
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/taskflow
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev     # Development
npm run build   # Production build
```

Frontend runs at: `http://localhost:5173`

---

## 🌐 API Documentation

### Auth Routes — `/api/auth`

| Method | Endpoint            | Description       | Auth Required |
|--------|---------------------|-------------------|---------------|
| POST   | `/api/auth/register`| Register new user | ❌            |
| POST   | `/api/auth/login`   | Login user        | ❌            |
| GET    | `/api/auth/me`      | Get current user  | ✅            |

### Task Routes — `/api/tasks`

| Method | Endpoint           | Description          | Auth Required |
|--------|--------------------|----------------------|---------------|
| GET    | `/api/tasks`       | Get all user tasks   | ✅            |
| POST   | `/api/tasks`       | Create new task      | ✅            |
| PUT    | `/api/tasks/:id`   | Update task          | ✅            |
| DELETE | `/api/tasks/:id`   | Delete task          | ✅            |
| PATCH  | `/api/tasks/:id/status` | Update status   | ✅            |

---

### Sample API Requests

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Create Task:**
```json
POST /api/tasks
Authorization: Bearer <token>
{
  "title": "Build the Login Page",
  "description": "Create a responsive login form with validation",
  "priority": "high",
  "dueDate": "2025-05-15",
  "status": "todo"
}
```

---

## 🚀 Deployment Guide

### Frontend → Vercel

```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel
vercel --prod
```

Set environment variable in Vercel dashboard:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables (MONGO_URI, JWT_SECRET, etc.)
7. Deploy!

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 12)
- **JWT** tokens with expiry (7 days)
- **CORS** configured for specific origins
- HTTP-only considerations for production
- Input validation on all routes
- User-scoped data (users can only access their own tasks)

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Login | Clean login form with validation |
| Register | Signup with real-time feedback |
| Dashboard | Kanban board with drag-and-drop |
| Task Modal | Create/Edit tasks with full details |

---

## 🧪 Testing the API

Use **Postman** or **Thunder Client (VS Code)**:

1. Register a user → get token
2. Copy the token
3. Add `Authorization: Bearer <token>` header to all task requests
4. Test CRUD operations

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.6.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.18.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.5",
  "@hello-pangea/dnd": "^16.3.0"
}
```

---

## 👤 Author

**Your Name**  
Full Stack Developer Intern Candidate  
📧 sajalsinghal62650@gmail.com  
