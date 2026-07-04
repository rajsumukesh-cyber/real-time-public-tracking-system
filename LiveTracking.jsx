import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Gauge, MapPin, Clock, User as UserIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MapView from '../../components/MapView';
import BusCard from '../../components/BusCard';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

// Rough ETA calculation from great-circle distance and current speed.
const estimateEtaMinutes = (lat1, lng1, lat2, lng2, speedKmh) => {
  if (!speedKmh || speedKmh < 2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round((distanceKm / speedKmh) * 60));
};

const LiveTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [results, setResults] = useState({ routes: [], drivers: [] });
  const [liveById, setLiveById] = useState({}); // driverId -> { lat, lng, speed, heading, status }
  const [selectedRouteId, setSelectedRouteId] = useState(searchParams.get('routeId') || null);
  const [selectedDriverId, setSelectedDriverId] = useState(searchParams.get('driverId') || null);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Get the passenger's own location once, for map centering
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    api.get('/passengers/me').then(({ data }) => {
      setFavorites((data.favoriteRoutes || []).map((r) => r._id));
    });
  }, []);

  const runSearch = useCallback(async (q) => {
    if (!q?.trim()) {
      setResults({ routes: [], drivers: [] });
      return;
    }
    const { data } = await api.get('/passengers/search', { params: { query: q } });
    setResults(data);
  }, []);

  useEffect(() => {
    if (query) runSearch(query);
  }, [query, runSearch]);

  // Load all live drivers initially, then keep positions fresh via socket
  useEffect(() => {
    api.get('/drivers/live').then(({ data }) => {
      const map = {};
      data.forEach((d) => {
        map[d._id] = {
          lat: d.location?.coordinates?.[1] || 0,
          lng: d.location?.coordinates?.[0] || 0,
          speed: d.speed,
          heading: d.heading,
          status: d.currentTripStatus,
          vehicleNumber: d.vehicleNumber,
          routeId: d.route?._id,
          routeName: d.route ? `${d.route.routeNumber} — ${d.route.name}` : null,
          driverName: d.user?.name,
        };
      });
      setLiveById(map);
    });

    const socket = getSocket();
    if (socket) {
      if (!socket.connected) socket.connect();
      const handler = (update) => {
        setLiveById((prev) => ({
          ...prev,
          [update.driverId]: { ...prev[update.driverId], ...update, lat: update.latitude, lng: update.longitude },
        }));
      };
      socket.on('busLocationUpdate', handler);
      return () => socket.off('busLocationUpdate', handler);
    }
  }, []);

  // Subscribe to the selected route's room for targeted updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedRouteId) return;
    socket.emit('joinRoute', { routeId: selectedRouteId });
    return () => socket.emit('leaveRoute', { routeId: selectedRouteId });
  }, [selectedRouteId]);

  const selectedRoute = useMemo(
    () => results.routes.find((r) => r._id === selectedRouteId),
    [results.routes, selectedRouteId]
  );

  const busMarkers = useMemo(
    () =>
      Object.entries(liveById).map(([id, b]) => ({
        id,
        lat: b.lat,
        lng: b.lng,
        heading: b.heading,
        status: b.status,
        label: b.vehicleNumber,
      })),
    [liveById]
  );

  const selectedBus = selectedDriverId ? liveById[selectedDriverId] : null;
  const eta =
    selectedBus && userLocation
      ? estimateEtaMinutes(selectedBus.lat, selectedBus.lng, userLocation.lat, userLocation.lng, selectedBus.speed)
      : null;

  const toggleFavorite = async (routeId) => {
    await api.patch(`/passengers/favorites/${routeId}`);
    setFavorites((prev) => (prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]));
  };

  return (
    <div className="flex min-h-screen bg-transit-fog">
      <Sidebar role="passenger" />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-transit-navy">Live tracking</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearchParams({ query });
          }}
          className="mb-6 flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-transit-slate" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bus number, route number, or stop name..."
              className="input-field pl-11"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MapView
              userLocation={userLocation}
              buses={busMarkers}
              routeStops={selectedRoute?.stops || []}
              onBusClick={(id) => setSelectedDriverId(id)}
              height="500px"
            />
          </div>

          <div className="space-y-4">
            {selectedBus && (
              <div className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-transit-navy">Bus details</h3>
                  <button onClick={() => setSelectedDriverId(null)} aria-label="Close">
                    <X size={16} className="text-transit-slate" />
                  </button>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-transit-slate">
                      <UserIcon size={14} /> Driver
                    </dt>
                    <dd className="font-medium text-transit-navy">{selectedBus.driverName || '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-transit-slate">Vehicle</dt>
                    <dd className="font-medium text-transit-navy">{selectedBus.vehicleNumber}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-transit-slate">
                      <Gauge size={14} /> Speed
                    </dt>
                    <dd className="font-medium text-transit-navy">{Math.round(selectedBus.speed || 0)} km/h</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-1 text-transit-slate">
                      <Clock size={14} /> ETA to you
                    </dt>
                    <dd className="font-medium text-transit-navy">{eta ? `${eta} min` : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-transit-slate">Status</dt>
                    <dd className="font-medium capitalize text-transit-navy">{selectedBus.status}</dd>
                  </div>
                </dl>
              </div>
            )}

            {results.routes.length > 0 && (
              <div className="card">
                <h3 className="mb-3 font-display font-semibold text-transit-navy">Matching routes</h3>
                <div className="space-y-2">
                  {results.routes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => setSelectedRouteId(r._id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                        selectedRouteId === r._id
                          ? 'border-transit-teal bg-transit-teal/5'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <span>
                        <span className="font-semibold text-transit-navy">{r.routeNumber}</span>{' '}
                        <span className="text-transit-slate">— {r.name}</span>
                      </span>
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(r._id);
                        }}
                        className="text-xs text-transit-teal hover:underline"
                      >
                        {favorites.includes(r._id) ? 'Unsave' : 'Save'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.drivers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-transit-navy">Matching buses</h3>
                {results.drivers.map((d) => (
                  <BusCard
                    key={d._id}
                    bus={{
                      vehicleNumber: d.vehicleNumber,
                      routeName: d.route ? `${d.route.routeNumber} — ${d.route.name}` : 'Unassigned',
                      status: d.currentTripStatus,
                      speed: d.speed,
                      nextStop: d.route?.stops?.[0]?.name,
                    }}
                    onClick={() => setSelectedDriverId(d._id)}
                  />
                ))}
              </div>
            )}

            {!results.routes.length && !results.drivers.length && query && (
              <div className="card flex items-center gap-2 text-sm text-transit-slate">
                <MapPin size={16} /> No matches for "{query}".
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveTracking;
