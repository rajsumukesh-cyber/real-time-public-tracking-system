import { useEffect, useState } from 'react';
import { MapPin, Ruler, ListChecks } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import MapView from '../../components/MapView';
import api from '../../services/api';

const RouteManagement = () => {
  const [driver, setDriver] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/drivers/me'), api.get('/drivers/trips/today')])
      .then(([driverRes, tripsRes]) => {
        setDriver(driverRes.data);
        setTrips(tripsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const route = driver?.route;

  return (
    <div className="flex min-h-screen bg-transit-fog">
      <Sidebar role="driver" />
      <main className="flex-1 p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-transit-navy">My route</h1>

        {!route ? (
          <div className="card text-center text-transit-slate">
            No route has been assigned to you yet. Contact your operator/admin.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <h2 className="font-display text-lg font-semibold text-transit-navy">
                {route.routeNumber} — {route.name}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-transit-slate">
                    <Ruler size={14} /> Distance
                  </dt>
                  <dd className="font-semibold text-transit-navy">{route.distanceKm} km</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1 text-transit-slate">
                    <ListChecks size={14} /> Stops
                  </dt>
                  <dd className="font-semibold text-transit-navy">{route.stops.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-transit-slate">Today's trips</dt>
                  <dd className="font-semibold text-transit-navy">{trips.length}</dd>
                </div>
              </dl>

              <h3 className="mt-6 mb-2 text-sm font-semibold text-transit-navy">Stops in order</h3>
              <ol className="space-y-2 text-sm text-transit-slate">
                {route.stops
                  .sort((a, b) => a.order - b.order)
                  .map((stop) => (
                    <li key={stop.name} className="flex items-center gap-2">
                      <MapPin size={14} className="text-transit-teal" /> {stop.name}
                    </li>
                  ))}
              </ol>
            </div>

            <div className="card lg:col-span-2">
              <h2 className="mb-4 font-display text-lg font-semibold text-transit-navy">Route map</h2>
              <MapView routeStops={route.stops} height="400px" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteManagement;
