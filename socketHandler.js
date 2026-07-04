const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

/**
 * Sets up all Socket.io event handling for the app.
 *
 * Events:
 *  - "driverLocationUpdate" (driver -> server): { latitude, longitude, speed, heading }
 *      Server persists the location and broadcasts "busLocationUpdate" to all
 *      passengers subscribed to that driver's route.
 *  - "joinRoute" (passenger -> server): { routeId }
 *      Passenger joins a room to receive live updates for buses on that route.
 *  - "leaveRoute" (passenger -> server): { routeId }
 *  - "busLocationUpdate" (server -> passengers): { driverId, latitude, longitude, speed, heading, status }
 *  - "driverStatusChanged" (server -> everyone): { driverId, onlineStatus }
 *  - "sos" (driver -> server): { driverId, latitude, longitude }
 *      Broadcast to admins/dashboard as an emergency alert.
 */
const initSocket = (io) => {
  // Authenticate socket connections using the JWT issued at login
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.user.id}, role ${socket.user.role})`);

    // Passenger subscribes to a route's room to get relevant bus updates only
    socket.on('joinRoute', ({ routeId }) => {
      if (routeId) socket.join(`route:${routeId}`);
    });

    socket.on('leaveRoute', ({ routeId }) => {
      if (routeId) socket.leave(`route:${routeId}`);
    });

    // Driver pushes a GPS update every ~5 seconds from the browser Geolocation API
    socket.on('driverLocationUpdate', async (payload) => {
      try {
        if (socket.user.role !== 'driver') return;
        const { latitude, longitude, speed = 0, heading = 0 } = payload;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

        const driver = await Driver.findOneAndUpdate(
          { user: socket.user.id },
          {
            location: { type: 'Point', coordinates: [longitude, latitude] },
            speed,
            heading,
            lastLocationUpdate: new Date(),
          },
          { new: true }
        );

        if (!driver) return;

        const update = {
          driverId: driver._id,
          latitude,
          longitude,
          speed,
          heading,
          status: driver.currentTripStatus,
          updatedAt: driver.lastLocationUpdate,
        };

        // Broadcast to passengers watching this driver's route, and to admin dashboards
        if (driver.route) {
          io.to(`route:${driver.route}`).emit('busLocationUpdate', update);
        }
        io.to('admins').emit('busLocationUpdate', update);
      } catch (err) {
        console.error('driverLocationUpdate error:', err.message);
      }
    });

    // Emergency SOS button on the driver dashboard
    socket.on('sos', (payload) => {
      if (socket.user.role !== 'driver') return;
      io.to('admins').emit('emergencyAlert', {
        driverId: socket.user.id,
        ...payload,
        timestamp: new Date(),
      });
    });

    // Admin dashboards join a shared room for aggregate live updates
    socket.on('joinAdmin', () => {
      if (socket.user.role === 'admin') socket.join('admins');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
