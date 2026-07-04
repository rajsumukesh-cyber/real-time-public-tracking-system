import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Clock, Bus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import BusCard from '../../components/BusCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState(null);
  const [liveDrivers, setLiveDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/passengers/me'), api.get('/drivers/live'), api.get('/routes')])
      .then(([profileRes, liveRes, routesRes]) => {
        setProfile(profileRes.data);
        setLiveDrivers(liveRes.data);
        setRoutes(routesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/passenger/tracking?query=${encodeURIComponent(query)}`);
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
      <Sidebar role="passenger" />

      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="font-display text-2xl font-bold text-transit-navy">
          Hi, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-transit-slate">Where are you headed today?</p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-transit-slate" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by bus number, route, or stop..."
              className="input-field pl-11"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-transit-navy">
              <Bus size={18} /> Nearby / active vehicles
            </h2>
            {liveDrivers.length === 0 ? (
              <div className="card text-sm text-transit-slate">
                No buses are online right now. Check back soon.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {liveDrivers.map((d) => (
                  <BusCard
                    key={d._id}
                    bus={{
                      vehicleNumber: d.vehicleNumber,
                      routeName: d.route ? `${d.route.routeNumber} — ${d.route.name}` : 'Unassigned',
                      status: d.currentTripStatus,
                      speed: d.speed,
                    }}
                    onClick={() => navigate(`/passenger/tracking?driverId=${d._id}`)}
                  />
                ))}
              </div>
            )}

            <h2 className="mb-4 mt-8 font-display text-lg font-semibold text-transit-navy">Popular routes</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {routes.slice(0, 4).map((r) => (
                <button
                  key={r._id}
                  onClick={() => navigate(`/passenger/tracking?routeId=${r._id}`)}
                  className="card flex items-center justify-between text-left hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div>
                    <p className="font-semibold text-transit-navy">{r.routeNumber}</p>
                    <p className="text-xs text-transit-slate">{r.name}</p>
                  </div>
                  <span className="text-xs text-transit-slate">{r.distanceKm} km</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-transit-navy">
                <Star size={16} className="text-transit-amber" /> Favorite routes
              </h3>
              {profile?.favoriteRoutes?.length ? (
                <ul className="space-y-2 text-sm text-transit-slate">
                  {profile.favoriteRoutes.map((r) => (
                    <li key={r._id}>
                      {r.routeNumber} — {r.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-transit-slate">No favorites yet. Save a route to see it here.</p>
              )}
            </div>

            <div className="card">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-transit-navy">
                <Clock size={16} /> Recent searches
              </h3>
              {profile?.recentSearches?.length ? (
                <ul className="space-y-2 text-sm text-transit-slate">
                  {profile.recentSearches.slice(0, 5).map((s, i) => (
                    <li key={i}>{s.query}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-transit-slate">Your recent searches will appear here.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PassengerDashboard;
