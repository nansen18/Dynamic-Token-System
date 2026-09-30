require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { connectDB, Services, getMemoryStore, setMemoryStore } = require('./database/store');
const { getSeedData } = require('./seed/seedData');
const estimationEngine = require('./services/estimationEngine');

const app = express();
const server = http.createServer(app);

// Enable CORS for all frontends (dev & preview ports)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Setup API routes
const apiRoutes = require('./routes/apiRoutes')(io);
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ONLINE', 
    timestamp: new Date(), 
    engine: 'Dynamic Wait Time Estimation Engine v2.0' 
  });
});

// Serve frontend production build if available
const path = require('path');
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


// Dynamic Periodic Scheduler:
// Runs every 20 seconds to recalculate wait times if consultations are dragging on
setInterval(async () => {
  try {
    const updated = await estimationEngine.recalculateSchedule();
    if (updated && updated.length > 0) {
      io.emit('SCHEDULE_UPDATED', { automated: true });
    }
  } catch (err) {
    console.error('[Scheduler] Periodic recalculation error:', err.message);
  }
}, 20000);

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB(process.env.MONGODB_URI);

  // Auto-seed if database is empty
  const currentServices = await Services.find({});
  if (currentServices.length === 0) {
    console.log('🌱 [Database] Empty database detected. Seeding with rich service center data...');
    const seedData = getSeedData();
    setMemoryStore(seedData);
    await estimationEngine.recalculateSchedule();
    console.log('✅ [Database] Seed data loaded successfully.');
  }

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 DYNAMIC TOKEN SYSTEM BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`⚡ Dynamic Engine: Active (EWMA + Concurrency + Overdue Penalty)`);
    console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`📡 Socket.IO Real-time Gateway: Ready`);
    console.log(`=======================================================`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal bootstrap error:', err);
});
