import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PassengerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState('');
  const [newStop, setNewStop] = useState({ name: '', latitude: '', longitude: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/passengers/me')
      .then(({ data }) => {
        setProfile(data);
        setAddress(data.address || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async (savedStops) => {
    const { data } = await api.put('/passengers/me', {
      address,
      savedStops: savedStops || profile.savedStops,
    });
    setProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addStop = (e) => {
    e.preventDefault();
    if (!newStop.name || !newStop.latitude || !newStop.longitude) return;
    const updated = [
      ...(profile.savedStops || []),
      {
        name: newStop.name,
        latitude: parseFloat(newStop.latitude),
        longitude: parseFloat(newStop.longitude),
      },
    ];
    save(updated);
    setNewStop({ name: '', latitude: '', longitude: '' });
  };

  const removeStop = (name) => {
    const updated = (profile.savedStops || []).filter((s) => s.name !== name);
    save(updated);
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-transit-fog">
      <Sidebar role="passenger" />
      <main className="flex-1 p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-transit-navy">Your profile</h1>

        {saved && (
          <div className="mb-6 rounded-xl bg-transit-teal/10 px-4 py-3 text-sm text-transit-teal">
            Profile updated.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-transit-navy">Account details</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-transit-slate">Name</dt>
                <dd className="font-medium text-transit-navy">{user?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-transit-slate">Email</dt>
                <dd className="font-medium text-transit-navy">{user?.email}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <label className="mb-1 block text-sm font-medium text-transit-navy">Home address</label>
              <div className="flex gap-2">
                <input
                  className="input-field"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                />
                <button onClick={() => save()} className="btn-primary shrink-0 !px-5">
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-transit-navy">Saved stops</h2>
            <ul className="mb-4 space-y-2">
              {(profile.savedStops || []).map((stop) => (
                <li
                  key={stop.name}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-2 text-sm"
                >
                  <span className="text-transit-navy">{stop.name}</span>
                  <button onClick={() => removeStop(stop.name)} aria-label={`Remove ${stop.name}`}>
                    <Trash2 size={14} className="text-transit-slate hover:text-red-500" />
                  </button>
                </li>
              ))}
              {(!profile.savedStops || profile.savedStops.length === 0) && (
                <p className="text-sm text-transit-slate">No saved stops yet.</p>
              )}
            </ul>

            <form onSubmit={addStop} className="grid grid-cols-3 gap-2">
              <input
                placeholder="Stop name"
                className="input-field col-span-3"
                value={newStop.name}
                onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
              />
              <input
                placeholder="Latitude"
                className="input-field"
                value={newStop.latitude}
                onChange={(e) => setNewStop({ ...newStop, latitude: e.target.value })}
              />
              <input
                placeholder="Longitude"
                className="input-field"
                value={newStop.longitude}
                onChange={(e) => setNewStop({ ...newStop, longitude: e.target.value })}
              />
              <button type="submit" className="btn-secondary col-span-3">
                Add stop
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PassengerProfile;
