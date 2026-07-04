import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriverProfile = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'Bus', licenseNumber: '' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/drivers/me')
      .then(({ data }) => {
        setDriver(data);
        setForm({
          vehicleNumber: data.vehicleNumber || '',
          vehicleType: data.vehicleType || 'Bus',
          licenseNumber: data.licenseNumber || '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/drivers/me', form);
    setDriver(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-transit-fog">
      <Sidebar role="driver" />
      <main className="flex-1 p-8">
        <h1 className="mb-6 font-display text-2xl font-bold text-transit-navy">Driver profile</h1>

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
              <div className="flex justify-between">
                <dt className="text-transit-slate">Assigned route</dt>
                <dd className="font-medium text-transit-navy">
                  {driver?.route?.routeNumber ? `${driver.route.routeNumber} — ${driver.route.name}` : 'Unassigned'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-transit-navy">Vehicle information</h2>
            {saved && (
              <div className="mb-4 rounded-xl bg-transit-teal/10 px-4 py-2 text-sm text-transit-teal">
                Profile updated.
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-transit-navy">Vehicle number</label>
                <input
                  className="input-field"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-transit-navy">Vehicle type</label>
                <select
                  className="input-field"
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                >
                  <option>Bus</option>
                  <option>Minibus</option>
                  <option>Shuttle</option>
                  <option>Van</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-transit-navy">License number</label>
                <input
                  className="input-field"
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Save changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverProfile;
