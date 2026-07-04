import { Bus, Gauge, MapPin, Clock } from 'lucide-react';

const statusStyles = {
  running: 'bg-transit-teal/10 text-transit-teal',
  delayed: 'bg-transit-amber/20 text-transit-amberDark',
  offline: 'bg-slate-200 text-transit-slate',
  idle: 'bg-slate-200 text-transit-slate',
};

const BusCard = ({ bus, onClick, isFavorite, onToggleFavorite }) => {
  const status = bus.status || 'offline';

  return (
    <button
      onClick={onClick}
      className="w-full animate-driveIn rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-transit-navy/5">
            <Bus size={18} className="text-transit-navy" />
          </span>
          <div>
            <p className="font-display font-semibold text-transit-navy">{bus.vehicleNumber}</p>
            <p className="text-xs text-transit-slate">{bus.routeName || 'Unassigned route'}</p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-transit-slate">
        <span className="flex items-center gap-1">
          <Gauge size={14} /> {bus.speed ? `${Math.round(bus.speed)} km/h` : '—'}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} /> {bus.nextStop || 'Next stop unavailable'}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> ETA {bus.eta || '—'}
        </span>
      </div>

      {onToggleFavorite && (
        <div className="mt-3 flex justify-end">
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="text-xs font-semibold text-transit-teal hover:underline"
          >
            {isFavorite ? 'Remove from favorites' : 'Save as favorite'}
          </span>
        </div>
      )}
    </button>
  );
};

export default BusCard;
