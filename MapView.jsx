import { useEffect, useRef } from 'react';

/**
 * Renders a Google Map with:
 *  - the user's current location
 *  - live bus markers (updated in place, not re-created, so movement looks smooth)
 *  - an optional route polyline + stop markers
 *
 * Requires window.google to be loaded (see index.html).
 *
 * Props:
 *  - userLocation: { lat, lng } | null
 *  - buses: [{ id, lat, lng, heading, label, status }]
 *  - routeStops: [{ latitude, longitude, name }]
 *  - onBusClick: (busId) => void
 */
const MapView = ({ userLocation, buses = [], routeStops = [], onBusClick, height = '480px' }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const busMarkers = useRef({});
  const userMarker = useRef(null);
  const polyline = useRef(null);

  useEffect(() => {
    if (!window.google || !mapRef.current || mapInstance.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: userLocation || { lat: 17.385, lng: 78.4867 },
      zoom: 13,
      mapId: 'TRANSIT_LIVE_MAP',
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
    });

    // Traffic layer, per the "Interactive Map" requirement
    const traffic = new window.google.maps.TrafficLayer();
    traffic.setMap(mapInstance.current);
  }, [userLocation]);

  // User location marker
  useEffect(() => {
    if (!window.google || !mapInstance.current || !userLocation) return;

    if (!userMarker.current) {
      userMarker.current = new window.google.maps.Marker({
        position: userLocation,
        map: mapInstance.current,
        title: 'You are here',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#1E9C89',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
    } else {
      userMarker.current.setPosition(userLocation);
    }
  }, [userLocation]);

  // Route polyline + stop markers
  useEffect(() => {
    if (!window.google || !mapInstance.current || routeStops.length === 0) return;

    if (polyline.current) polyline.current.setMap(null);

    const path = routeStops.map((s) => ({ lat: s.latitude, lng: s.longitude }));
    polyline.current = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#0B2B45',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map: mapInstance.current,
    });

    routeStops.forEach((stop) => {
      new window.google.maps.Marker({
        position: { lat: stop.latitude, lng: stop.longitude },
        map: mapInstance.current,
        title: stop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#F2A93B',
          fillOpacity: 1,
          strokeColor: '#0B2B45',
          strokeWeight: 1,
        },
      });
    });
  }, [routeStops]);

  // Live bus markers - update position in place for smooth movement
  useEffect(() => {
    if (!window.google || !mapInstance.current) return;

    const activeIds = new Set(buses.map((b) => b.id));

    // Remove markers for buses no longer present
    Object.keys(busMarkers.current).forEach((id) => {
      if (!activeIds.has(id)) {
        busMarkers.current[id].setMap(null);
        delete busMarkers.current[id];
      }
    });

    buses.forEach((bus) => {
      const position = { lat: bus.lat, lng: bus.lng };
      const color =
        bus.status === 'running' ? '#1E9C89' : bus.status === 'delayed' ? '#F2A93B' : '#94A3B8';

      if (!busMarkers.current[bus.id]) {
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance.current,
          title: bus.label,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            rotation: bus.heading || 0,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1,
          },
        });
        marker.addListener('click', () => onBusClick?.(bus.id));
        busMarkers.current[bus.id] = marker;
      } else {
        busMarkers.current[bus.id].setPosition(position);
        busMarkers.current[bus.id].setIcon({
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          rotation: bus.heading || 0,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
        });
      }
    });
  }, [buses, onBusClick]);

  if (!window.google) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-sm text-transit-slate"
      >
        Map unavailable — add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable Google Maps.
      </div>
    );
  }

  return <div ref={mapRef} style={{ height }} className="w-full rounded-2xl" />;
};

export default MapView;
