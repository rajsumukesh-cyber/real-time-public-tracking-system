import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

import DriverDashboard from './pages/driver/DriverDashboard';
import DriverProfile from './pages/driver/DriverProfile';
import RouteManagement from './pages/driver/RouteManagement';

import PassengerDashboard from './pages/passenger/PassengerDashboard';
import LiveTracking from './pages/passenger/LiveTracking';
import PassengerProfile from './pages/passenger/PassengerProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/driver/dashboard"
        element={
          <ProtectedRoute role="driver">
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/profile"
        element={
          <ProtectedRoute role="driver">
            <DriverProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/route"
        element={
          <ProtectedRoute role="driver">
            <RouteManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/passenger/dashboard"
        element={
          <ProtectedRoute role="passenger">
            <PassengerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/tracking"
        element={
          <ProtectedRoute role="passenger">
            <LiveTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/profile"
        element={
          <ProtectedRoute role="passenger">
            <PassengerProfile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
