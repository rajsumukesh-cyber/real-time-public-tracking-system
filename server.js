require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const routeRoutes = require('./routes/routeRoutes');
const tripRoutes = require('./routes/tripRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});
app.set('io', io);
initSocket(io);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
