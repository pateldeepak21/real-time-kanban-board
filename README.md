# 🚀 Real-Time Kanban Board

A full-stack **real-time Kanban board application** built using WebSockets.  
Users can create, update, and move tasks across columns with instant live updates.

---

## 🌐 Live Repository

🔗 https://github.com/pateldeepak21/real-time-kanban-board

---

## 📌 Features

- Create tasks
- Move tasks between columns
- Real-time synchronization using WebSockets
- Clean and responsive UI
- Unit testing with Vitest
- End-to-end testing with Playwright
- Environment variable configuration
- Structured full-stack architecture

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS
- Vitest (Unit Testing)
- Playwright (E2E Testing)

### Backend
- Node.js
- Express
- WebSocket (ws)

---

## 📂 Project Structure

```
real-time-kanban-board/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── tests/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/pateldeepak21/real-time-kanban-board.git
cd real-time-kanban-board
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs at:

```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🧪 Running Tests

### Run Unit Tests

```bash
cd frontend
npm run test
```

### Run Playwright E2E Tests

```bash
npx playwright test
```

---

## 🔌 Environment Variables

Create a `.env` file inside the `backend` folder:

```
PORT=5000
```

---

## 🌍 Real-Time Functionality

This application uses WebSockets to:

- Broadcast task updates to all connected users
- Maintain live board state
- Sync multiple clients instantly

---

## 🚀 Future Improvements

- User Authentication
- Database Integration (MongoDB / PostgreSQL)
- Persistent Storage
- Deployment (Render / Vercel)
- CI/CD Integration

---

## 👨‍💻 Author

**Deepak Patel**  
GitHub: https://github.com/pateldeepak21

---

## 📄 License

This project is licensed under the MIT License.
