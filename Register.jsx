import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'driver' ? 'driver' : 'passenger';

  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleNumber: '',
    vehicleType: 'Bus',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      navigate(user.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transit-fog px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-transit-navy">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-transit-teal text-white">
            <Bus size={18} />
          </span>
          <span className="font-display text-xl font-bold">TransitLive</span>
        </Link>

        <div className="card">
          <h1 className="font-display text-2xl font-bold text-transit-navy">Create your account</h1>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {['passenger', 'driver'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                  role === r ? 'bg-white text-transit-navy shadow-sm' : 'text-transit-slate'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-transit-navy">Full name</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-transit-navy">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-transit-navy">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-transit-navy">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {role === 'driver' && (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-transit-navy">Vehicle number</label>
                  <input
                    required
                    className="input-field"
                    value={form.vehicleNumber}
                    onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    placeholder="TS09AB1234"
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
                    required
                    className="input-field"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-transit-slate">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-transit-teal hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
