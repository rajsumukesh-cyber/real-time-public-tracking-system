import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Radio,
  ShieldCheck,
  Smartphone,
  Bus,
  Users,
  Navigation,
  BellRing,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: Radio,
    title: 'Live GPS tracking',
    desc: 'Every bus reports its position every 5 seconds, so the map is never stale.',
  },
  {
    icon: MapPin,
    title: 'Accurate ETAs',
    desc: 'Arrival times are calculated from live speed and distance to your stop.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    desc: 'Separate, secure dashboards for drivers and passengers with JWT auth.',
  },
  {
    icon: Smartphone,
    title: 'Built for mobile',
    desc: 'A responsive interface that works as well on a phone at the bus stop as on desktop.',
  },
];

const steps = [
  {
    title: 'Drivers go online',
    desc: 'A driver logs in, selects their assigned route, and starts a trip. Their phone becomes the GPS beacon.',
  },
  {
    title: 'Location streams in real time',
    desc: 'Coordinates are pushed over Socket.io every few seconds and stored against the driver profile.',
  },
  {
    title: 'Passengers see it happen live',
    desc: 'Anyone tracking that route sees the bus move on the map, with live ETA, speed, and next stop.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-transit-fog">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-transit-navy text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-transit-teal/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-transit-tealLight">
              Built for small-city transit networks
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Know exactly where your bus is —{' '}
              <span className="text-transit-tealLight">right now.</span>
            </h1>
            <p className="mt-5 max-w-md text-white/70">
              TransitLive connects drivers and passengers with real-time GPS tracking, live ETAs,
              and route maps — so nobody stands at a stop wondering if the bus is coming.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register?role=passenger" className="btn-amber">
                Passenger Login
              </Link>
              <Link to="/register?role=driver" className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-transit-navy">
                Driver Login
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Route R1 · Downtown Loop</span>
              <span className="flex items-center gap-1 text-transit-tealLight">
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-transit-tealLight" />
                Live
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Bus TS09AB1234', eta: '3 min', stop: 'City Mall' },
                { name: 'Bus TS09CD5678', eta: '11 min', stop: 'Tech Park' },
              ].map((b) => (
                <div key={b.name} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Bus size={16} className="text-transit-amber" />
                    <span className="text-sm font-medium">{b.name}</span>
                  </div>
                  <div className="text-right text-xs text-white/60">
                    <p className="font-semibold text-white">{b.eta}</p>
                    <p>{b.stop}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-bold text-transit-navy">
          Small cities deserve real-time transit too
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-transit-slate">
          Most tracking apps only exist for major metros. TransitLive is a lightweight, full-stack
          platform any city or campus shuttle network can deploy — a driver app, a passenger app,
          and a live map, all connected over one shared backend.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-display text-3xl font-bold text-transit-navy">Features</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-transit-teal/10 text-transit-teal">
                  <Icon size={22} />
                </span>
                <h3 className="font-display text-lg font-semibold text-transit-navy">{title}</h3>
                <p className="mt-2 text-sm text-transit-slate">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-bold text-transit-navy">How it works</h2>
        <div className="mt-12 space-y-8">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-transit-navy font-display font-bold text-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="mt-2 h-full w-px flex-1 bg-slate-200" />}
              </div>
              <div className="pb-4">
                <h3 className="font-display text-lg font-semibold text-transit-navy">{step.title}</h3>
                <p className="mt-1 text-sm text-transit-slate">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-transit-navy py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {[
            { icon: Users, title: 'For passengers', desc: 'Stop guessing. See exactly when your bus will arrive.' },
            { icon: Navigation, title: 'For drivers', desc: 'One tap to go online — the app handles the rest.' },
            { icon: BellRing, title: 'For operators', desc: 'A live view of the whole fleet, trip history, and alerts.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Icon className="mb-3 text-transit-tealLight" />
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
