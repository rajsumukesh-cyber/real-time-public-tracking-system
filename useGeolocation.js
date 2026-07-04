import { useEffect, useRef, useState } from 'react';

/**
 * Watches the browser's Geolocation API and invokes onUpdate every
 * `intervalMs` (default 5000ms) with the latest coordinates, matching
 * the driver-side "update every 5 seconds" requirement.
 *
 * Usage:
 *   const { position, error, isTracking, start, stop } = useGeolocation(onUpdate);
 */
const useGeolocation = (onUpdate, intervalMs = 5000) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchId = useRef(null);
  const lastEmit = useRef(0);

  const start = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : 0, // m/s -> km/h
          heading: pos.coords.heading || 0,
        };
        setPosition(coords);
        setError(null);

        const now = Date.now();
        if (now - lastEmit.current >= intervalMs) {
          lastEmit.current = now;
          onUpdate?.(coords);
        }
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
    setIsTracking(true);
  };

  const stop = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => stop, []);

  return { position, error, isTracking, start, stop };
};

export default useGeolocation;
