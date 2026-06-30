import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { SelectedLocation } from '../../types/location';
import { getAvailableMapLayers, type MapLayerType } from '../../services/weatherMapService';
import styles from './ForecastMap.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface RecenterProps {
  lat: number;
  lon: number;
}

function RecenterMap({ lat, lon }: RecenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 10);
  }, [lat, lon, map]);
  return null;
}

interface Props {
  location: SelectedLocation;
}

export function ForecastMap({ location }: Props) {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('none');
  const [timeOffset, setTimeOffset] = useState(0);
  const layers = getAvailableMapLayers();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>🗺️ Weather Map</h3>
        <div className={styles.layerButtons}>
          {layers.map(layer => (
            <button
              key={layer.id}
              className={`${styles.layerBtn} ${activeLayer === layer.id ? styles.layerActive : ''}`}
              onClick={() => setActiveLayer(activeLayer === layer.id ? 'none' : layer.id)}
              title={layer.available ? layer.label : `${layer.label} (coming soon)`}
            >
              {layer.label}
              {!layer.available && <span className={styles.soon}> soon</span>}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.mapWrapper}>
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={10}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={location.latitude} lon={location.longitude} />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <strong>{location.displayName || location.name}</strong><br />
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <div className={styles.sliderRow}>
        <label className={styles.sliderLabel}>⏱ Time offset: +{timeOffset}h</label>
        <input
          type="range"
          min={0}
          max={6}
          value={timeOffset}
          onChange={e => setTimeOffset(Number(e.target.value))}
          className={styles.slider}
        />
      </div>
      <p className={styles.placeholder}>
        🛰️ Radar integration coming soon — placeholder service ready for EUMETNET OPERA data integration.
      </p>
    </div>
  );
}
