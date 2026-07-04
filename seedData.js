/**
 * Seeds the database with sample users, routes, and drivers for local testing.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Driver = require('../models/Driver');
const Passenger = require('../models/Passenger');
const Route = require('../models/Route');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Passenger.deleteMany({}),
    Route.deleteMany({}),
  ]);

  console.log('Creating routes...');
  const routeA = await Route.create({
    routeNumber: 'R1',
    name: 'Downtown - University Loop',
    distanceKm: 12.5,
    estimatedDurationMinutes: 35,
    stops: [
      { name: 'Central Bus Station', latitude: 17.385, longitude: 78.4867, order: 1 },
      { name: 'City Mall', latitude: 17.4, longitude: 78.48, order: 2 },
      { name: 'University Gate', latitude: 17.415, longitude: 78.475, order: 3 },
      { name: 'Tech Park', latitude: 17.43, longitude: 78.47, order: 4 },
    ],
  });

  const routeB = await Route.create({
    routeNumber: 'R2',
    name: 'Airport Express',
    distanceKm: 22.0,
    estimatedDurationMinutes: 45,
    stops: [
      { name: 'Railway Station', latitude: 17.38, longitude: 78.49, order: 1 },
      { name: 'Ring Road Junction', latitude: 17.36, longitude: 78.5, order: 2 },
      { name: 'Airport Terminal 1', latitude: 17.24, longitude: 78.43, order: 3 },
    ],
  });

  console.log('Creating admin user...');
  await User.create({
    name: 'System Admin',
    email: 'admin@transit.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('Creating driver users...');
  const driverUser1 = await User.create({
    name: 'Ravi Kumar',
    email: 'driver1@transit.com',
    password: 'driver123',
    phone: '9000000001',
    role: 'driver',
  });
  await Driver.create({
    user: driverUser1._id,
    vehicleNumber: 'TS09AB1234',
    vehicleType: 'Bus',
    licenseNumber: 'DL-1234567890',
    route: routeA._id,
    onlineStatus: false,
  });

  const driverUser2 = await User.create({
    name: 'Anita Sharma',
    email: 'driver2@transit.com',
    password: 'driver123',
    phone: '9000000002',
    role: 'driver',
  });
  await Driver.create({
    user: driverUser2._id,
    vehicleNumber: 'TS09CD5678',
    vehicleType: 'Minibus',
    licenseNumber: 'DL-0987654321',
    route: routeB._id,
    onlineStatus: false,
  });

  console.log('Creating passenger user...');
  const passengerUser = await User.create({
    name: 'Sam Patel',
    email: 'passenger1@transit.com',
    password: 'passenger123',
    phone: '9000000003',
    role: 'passenger',
  });
  await Passenger.create({
    user: passengerUser._id,
    favoriteRoutes: [routeA._id],
  });

  console.log('Seed complete!');
  console.log('---------------------------------');
  console.log('Admin login:     admin@transit.com / admin123');
  console.log('Driver 1 login:  driver1@transit.com / driver123');
  console.log('Driver 2 login:  driver2@transit.com / driver123');
  console.log('Passenger login: passenger1@transit.com / passenger123');
  console.log('---------------------------------');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
