require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' } });

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch { next(new Error('Auth failed')); }
});

io.on('connection', (socket) => {
  socket.join(`user_${socket.userId}`);
  console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}).catch(err => { console.error('DB connection failed:', err); process.exit(1); });
