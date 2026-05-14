import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

// Fix for default Leaflet icon issues in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to auto-center the map when stops change
const RecenterMap = ({ center, stops }) => {
  const map = useMap();
  React.useEffect(() => {
    if (stops && stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, 7);
    }
  }, [stops, center, map]);
  return null;
};

const StopMap = ({ stops }) => {
  // Validate and filter stops
  const validStops = useMemo(() => {
    return (stops || [])
      .filter(stop => stop.latitude != null && stop.longitude != null)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }, [stops]);

  // Calculate default center
  const center = useMemo(() => {
    if (validStops.length === 0) return [18.5204, 73.8567]; // Pune
    const sumLat = validStops.reduce((acc, stop) => acc + stop.latitude, 0);
    const sumLng = validStops.reduce((acc, stop) => acc + stop.longitude, 0);
    return [sumLat / validStops.length, sumLng / validStops.length];
  }, [validStops]);

  // Create polyline path
  const path = useMemo(() => {
    return validStops.map(stop => [stop.latitude, stop.longitude]);
  }, [validStops]);

  // Custom marker colors using simple SVG icons
  const createIcon = (color) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-div-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  return (
    <div className="relative group shadow-xl rounded-[1.5rem] border border-gray-100 overflow-hidden bg-white">
      <MapContainer 
        center={center} 
        zoom={7} 
        style={{ height: '400px', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Route Line */}
        <Polyline
          positions={path}
          pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, lineJoin: 'round' }}
        />

        {/* Stop Markers */}
        {validStops.map((stop, index) => {
          const isStart = index === 0;
          const isEnd = index === validStops.length - 1;
          const color = isStart ? '#16a34a' : isEnd ? '#dc2626' : '#2563eb';
          
          return (
            <Marker 
              key={stop.id} 
              position={[stop.latitude, stop.longitude]}
              icon={createIcon(color)}
            >
              <Popup>
                <div className="p-1 min-w-[120px]">
                  <h6 className="font-bold text-gray-800 text-xs mb-1">{stop.name}</h6>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center bg-blue-50 px-2 py-0.5 rounded text-[9px] font-bold text-blue-600">
                      <span>ARRIVAL</span>
                      <span>{stop.arrivalTime || '--:--'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-green-50 px-2 py-0.5 rounded text-[9px] font-bold text-green-600">
                      <span>DEPARTURE</span>
                      <span>{stop.departureTime || '--:--'}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <RecenterMap center={center} stops={validStops} />
      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-gray-100 shadow-lg flex flex-col gap-2 z-[1000]">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600 border border-white"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Start Point</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600 border border-white"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Intermediate</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Destination</span>
         </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm z-[1000]">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Click markers for times</p>
      </div>
    </div>
  );
};

export default StopMap;
