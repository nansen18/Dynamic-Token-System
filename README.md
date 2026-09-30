# ⚡ NexusQueue: Dynamic Waiting Time Estimation Token System (MERN Stack)

> **Solving Waiting Uncertainty in Service Centers (Hospitals, Banks, Government Offices / DMV)**  
> Built with MongoDB, Express.js, React, Node.js, and WebSockets (Socket.IO).

---

## 🎯 The Core Problem & Innovative Solution

Traditional service center token systems are **static and naive**:
- They rely on a fixed benchmark formula: $\text{Wait Time} = \text{Queue Position} \times \text{Fixed Duration (e.g. 10m)}$.
- **The Failure Point**: If a doctor encounters a cardiac complication that takes 35 minutes instead of 10, or a bank teller processes a complex commercial loan with multi-tier KYC verification, **the 10 waiting visitors behind them receive no warning**. Waiting lobbies become overcrowded, patients experience anxiety, and appointment schedules collapse.

### 🚀 How NexusQueue's Dynamic Estimation Engine Works:
1. **Exponentially Weighted Moving Average (EWMA) Service Velocity**:
   Rather than static assumptions, the engine analyzes a sliding window of the last $N$ completed transactions per service category:
   $$D_{\text{eff}} = \left( \sum_{i=1}^N w_i \cdot T_i \right) \times 0.75 + D_{\text{base}} \times 0.25$$
   where $w_i$ gives the newest completed services the highest mathematical weight.
2. **Real-Time In-Progress Overdue Detection**:
   If an ongoing consultation at Counter $k$ exceeds its expected benchmark:
   $$\text{Overdue Delay} = (t_{\text{now}} - t_{\text{start}}) - D_{\text{expected}}$$
   This delay is **immediately injected into the schedule**, shifting waiting passengers' countdowns dynamically and displaying an informative notice (e.g., `⚠️ Delayed +4 mins: Complex consultation underway`).
3. **Active Multi-Counter Concurrency Scaling**:
   The engine factors in active desk count and staff throughput ratings ($c_j$):
   $$\text{Throughput Rate} = \sum_{j \in \text{Active Counters}} \text{ThroughputMultiplier}_j$$
   If an officer takes lunch or break, capacity instantly adjusts across all waiting queues.
4. **Priority Preemption (Emergency / Senior / VIP)**:
   Emergency cases jump directly to position #1, dynamically recalculating the subsequent visitors with a transparent notification alert.

---

## 🏗️ System Architecture & Multi-Role Interfaces

The application is structured into 5 dedicated modules:

1. 🎫 **Smart Kiosk Booking Terminal**:
   - Multi-sector support: **Healthcare / Hospital**, **Retail Banking**, and **Government Office / DMV**.
   - Side-by-side view of **Base Benchmark SLA** vs **Real-Time Dynamic Pace** before booking.
   - Priority tier selection: `REGULAR`, `SENIOR_DISABILITY`, `EMERGENCY_CRITICAL`, and `VIP`.
   - Generates digital token slips with QR code simulation and live tracking shortcuts.

2. 📱 **Customer Live Token Tracker**:
   - Real-time countdown timer to expected call time.
   - Dynamic explanation badge revealing *why* the wait time changed (e.g. *Consultation ahead took longer*, *Senior priority slot*, *Express throughput*).
   - Live queue position (`#2 in line ahead of 4 others`).
   - Milestone progress tracker.

3. 📺 **Waiting Hall Central TV Display Board**:
   - Airport/Hospital style large format digital signage for lobby monitors.
   - **NOW SERVING** board with glowing cards, counter assignments, and staff names.
   - **UPCOMING QUEUE** with dynamic ETAs.
   - **Built-in Web Audio API Chime**: Crystal clear 2-note bell chime with optional Text-to-Speech voice synthesizer (`"Attention please. Token M E D 0 0 2, proceed to Room 101"`).

4. 💼 **Officer Counter Service Desk**:
   - Operator console for doctors, tellers, and administrative staff.
   - Interactive consultation stopwatch counting live service elapsed time.
   - Visual overdue warning state when consultation runs longer than benchmark.
   - Controls: `Call Next`, `Start Consultation`, `Complete Service & Calibrate Algorithm`, `Mark No-Show`, `Take Break`.

5. 📊 **Operational Analytics & Live Simulator**:
   - Comparison telemetry: Static Model vs NexusQueue Adaptive Engine.
   - Real-time KPIs: Active Queue, Avg Dynamic Wait, Avg Actual Service Duration, Mean Prediction Drift.
   - **1-Click Live Simulator**:
     - *Simulate 32-min Complex Case*
     - *Simulate 2.5-min Express Transaction*
     - *Simulate Emergency Case Rush*

---

## 📁 Repository Structure

```
dynamic-token-system/
├── backend/
│   ├── .data/                  # Persistent database store
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── counterController.js
│   │   ├── serviceController.js
│   │   └── tokenController.js
│   ├── database/
│   │   └── store.js            # Dual-Engine: MongoDB/Mongoose + Zero-Config Embedded Engine
│   ├── models/
│   │   └── models.js           # Mongoose Schemas (Tokens, Services, Counters, AnalyticsLogs)
│   ├── routes/
│   │   └── apiRoutes.js        # RESTful API Endpoints
│   ├── seed/
│   │   └── seedData.js         # Rich realistic seed records (Hospital, Bank, DMV)
│   ├── services/
│   │   └── estimationEngine.js # Adaptive Wait Time Estimation Algorithm
│   ├── package.json
│   └── server.js               # Express + Socket.IO Server & Automated Scheduler
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── KioskBooking.jsx
│   │   │   ├── LobbyDisplay.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OfficerTerminal.jsx
│   │   │   └── TokenTracker.jsx
│   │   ├── services/
│   │   │   └── api.js          # REST Client & Socket.IO Listener
│   │   ├── utils/
│   │   │   └── sound.js        # Pure Web Audio API Chime & Speech Synthesizer
│   │   ├── App.jsx             # Main Application Root
│   │   ├── index.css
│   │   └── main.jsx
│   ├── dist/                   # Production build
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── package.json                # Root Runner
```

---

## ⚡ Quick Start & Execution

The application features an **Intelligent Dual-Mode Persistence Layer**:
- If MongoDB is running on your machine or an Atlas connection is provided in `MONGODB_URI`, it automatically connects and stores data in MongoDB collections.
- If MongoDB is not installed or offline, it **seamlessly activates the High-Performance JSON-backed embedded engine** in `.data/store.json`. **It runs immediately with zero setup prerequisites!**

### Running the Application

1. Open a terminal in the project directory:
   ```bash
   cd C:\Users\nanse\.gemini\antigravity\scratch\dynamic-token-system
   ```

2. Start the Backend Server (which also serves the compiled React application):
   ```bash
   cd backend
   node server.js
   ```

3. Open your browser:
   ```
   http://localhost:5000
   ```

### Running Frontend in Hot-Reload Development Mode (Optional)

If you wish to edit frontend components with instant Vite HMR:
```bash
cd frontend
npm run dev
```
And open `http://localhost:5173`.

---

## 🧪 Demonstration Walkthrough

1. **Observe Seed Data**: Click **"Reset & Seed Demo"** on the top navigation bar to populate realistic hospital consultations, bank teller queues, and DMV applications.
2. **Trigger a Delay**:
   - Go to the **Officer Desk Terminal** tab and select `Room 101 - Dr. Sarah Chen`.
   - Start or complete a consultation with an extended time (e.g. 30 minutes).
   - Switch to **Live Token Tracker** or **Lobby TV Display** to watch the subsequent patients' expected call times shift backward automatically, accompanied by the explanation banner!
3. **Emergency Preemption**:
   - Go to **Book Token (Kiosk)**, choose `Emergency & Acute Care`, select `Priority: Emergency / Critical`, and click Generate.
   - Switch to **Lobby TV Display**: Observe the emergency patient jump to the head of the queue.
4. **Desk Break Impact**:
   - In **Officer Desk Terminal**, click `Take Break`.
   - The system recalculates wait times with reduced capacity, demonstrating dynamic concurrency adjustment.
