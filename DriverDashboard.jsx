import { useEffect, useState, useCallback } from 'react';
import { Power, PlayCircle, StopCircle, Siren, Gauge, MapPin } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MapView from '../../components/MapView';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import useGeolocation from '../../hooks/useGeolocation';
import { useAuth } from '../../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/drivers/me');
      setDriver(data);
    } catch (err) {
      setStatusMsg('Could not load driver profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onLocationUpdate = useCallback((coords) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('driverLocationUpdate', coords);
    }
  }, []);

  const { position, error: geoError, isTracking, start, stop } = useGeolocation(onLocationUpdate, 5000);

  const goOnline = async () => {
    try {
      const { data } = await api.patch('/drivers/status', { online: true });
      setDriver(data);
      const socket = getSocket();
      if (socket) {
        socket.connect();
      }
      start();
      setStatusMsg('You are online. Sharing live location every 5 seconds.');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to go online.');
    }
  };

  const goOffline = async () => {
    try {
      const { data } = await api.patch('/drivers/status', { online: false });
      setDriver(data);
      stop();
      setStatusMsg('You are offline.');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to go offline.');
    }
  };

  const startTrip = async () => {
    try {
      const { data } = await api.post('/drivers/trips/start');
      setActiveTrip(data);
      setStatusMsg('Trip started.');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to start trip.');
    }
  };

  const endTrip = async () => {
    if (!activeTrip) return;
    try {
      await api.post(`/drivers/trips/${activeTrip._id}/end`);
      setActiveTrip(null);
      setStatusMsg('Trip ended.');
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to end trip.');
    }
  };

  const sendSOS = () => {
    const socket = getSocket();
    if (socket && socket.connected && position) {
      socket.emit('sos', { latitude: position.latitude, longitude: position.longitude });
      setStatusMsg('Emergency alert sent to control room.');
    } else {
      setStatusMsg('Go online first so your location can be shared with the alert.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transit-fog">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-transit-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-transit-fog">
      <Sidebar role="driver" />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-transit-navy">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-transit-slate">
              Vehicle {driver?.vehicleNumber} · Route {driver?.route?.routeNumber || 'Unassigned'}
            </p>
          </div>

          <div className="flex gap-3">
            {driver?.onlineStatus ? (
              <button onClick={goOffline} className="btn-secondary">
                <Power size={16} className="mr-2" /> Go Offline
              </button>
            ) : (
              <button onClick={goOnline} className="btn-primary">
                <Power size={16} className="mr-2" /> Go Online
              </button>
            )}

            {activeTrip ? (
              <button onClick={endTrip} className="btn-amber">
                <StopCircle size={16} className="mr-2" /> End Trip
              </button>
            ) : (
              <button
                onClick={startTrip}
                disabled={!driver?.onlineStatus}
                className="btn-amber disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlayCircle size={16} className="mr-2" /> Start Trip
              </button>
            )}

            <button onClick={sendSOS} className="btn-secondary !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white">
              <Siren size={16} className="mr-2" /> SOS
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mb-6 rounded-xl bg-transit-teal/10 px-4 py-3 text-sm text-transit-teal">{statusMsg}</div>
        )}
        {geoError && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Location error: {geoError}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-1">
            <h2 className="font-display text-lg font-semibold text-transit-navy">Current status</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-transit-slate">Status</dt>
                <dd className="font-semibold capitalize text-transit-navy">
                  {driver?.currentTripStatus}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-transit-slate">GPS tracking</dt>
                <dd className="font-semibold text-transit-navy">{isTracking ? 'Active' : 'Paused'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1 text-transit-slate">
                  <Gauge size={14} /> Speed
                </dt>
                <dd className="font-semibold text-transit-navy">
                  {position ? `${Math.round(position.speed)} km/h` : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1 text-transit-slate">
                  <MapPin size={14} /> Coordinates
                </dt>
                <dd className="text-right text-xs font-medium text-transit-navy">
                  {position ? `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}` : '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-semibold text-transit-navy">Live position</h2>
            <MapView
              userLocation={position ? { lat: position.latitude, lng: position.longitude } : null}
              routeStops={driver?.route?.stops || []}
              height="360px"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
