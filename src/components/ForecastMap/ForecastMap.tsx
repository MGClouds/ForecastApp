import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { SelectedLocation } from '../../types/location';
import {
  fetchRainViewerData,
  getRadarTileUrl,
  getSatelliteTileUrl,
  formatFrameTime,
  type RainViewerData,
  type RadarFrame,
} from '../../services/radarService';
import { useLanguage } from '../../i18n/LanguageContext';
import styles from './ForecastMap.module.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], 10);
  }, [lat, lon, map]);
  return null;
}

interface Props {
  location: SelectedLocation;
}

type ActiveLayer = 'none' | 'radar' | 'satellite';

export function ForecastMap({ location }: Props) {
  const { t } = useLanguage();
  const [rainviewerData, setRainviewerData] = useState<RainViewerData | null>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('none');
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [satelliteFrames, setSatelliteFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radarError, setRadarError] = useState(false);

  useEffect(() => {
    fetchRainViewerData()
      .then(data => {
        setRainviewerData(data);
        const radar: RadarFrame[] = [
          ...data.radar.past.map(f => ({ ...f, type: 'past' as const })),
          ...data.radar.nowcast.map(f => ({ ...f, type: 'nowcast' as const })),
        ];
        const satellite: RadarFrame[] = data.satellite.infrared.map(f => ({
          ...f,
          type: 'satellite' as const,
        }));
        setRadarFrames(radar);
        setSatelliteFrames(satellite);
        setCurrentFrameIndex(Math.max(0, data.radar.past.length - 1));
      })
      .catch(() => setRadarError(true));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const frames = activeLayer === 'satellite' ? satelliteFrames : radarFrames;
    if (frames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying, activeLayer, radarFrames, satelliteFrames]);

  const handleSetLayer = useCallback((layer: ActiveLayer) => {
    setActiveLayer(layer);
    setIsPlaying(false);
    if (layer === 'satellite') {
      setCurrentFrameIndex(0);
    } else if (layer === 'radar') {
      setCurrentFrameIndex(Math.max(0, radarFrames.length - (radarFrames.findIndex(f => f.type === 'nowcast') > -1 ? radarFrames.findIndex(f => f.type === 'nowcast') : radarFrames.length)));
    }
  }, [radarFrames]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const activeFrames = activeLayer === 'satellite' ? satelliteFrames : radarFrames;
  const currentFrame = activeFrames[currentFrameIndex];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t.weatherMap}</h3>
        <div className={styles.layerButtons}>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'none' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('none')}
          >{t.mapOnly}</button>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'radar' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('radar')}
          >{t.rainRadar}</button>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'satellite' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('satellite')}
          >{t.satellite}</button>
          <button className={styles.layerBtn} disabled title="coming soon">{t.snowLayer}<span className={styles.soon}> {t.comingSoon}</span></button>
          <button className={styles.layerBtn} disabled title="coming soon">{t.windLayer}<span className={styles.soon}> {t.comingSoon}</span></button>
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
          {activeLayer === 'radar' && currentFrame && rainviewerData && (
            <TileLayer
              key={`radar-${currentFrame.time}`}
              url={getRadarTileUrl(rainviewerData.host, currentFrame.path)}
              opacity={0.7}
              attribution="RainViewer"
              zIndex={2}
            />
          )}
          {activeLayer === 'satellite' && currentFrame && rainviewerData && (
            <TileLayer
              key={`sat-${currentFrame.time}`}
              url={getSatelliteTileUrl(rainviewerData.host, currentFrame.path)}
              opacity={0.7}
              attribution="RainViewer"
              zIndex={2}
            />
          )}
        </MapContainer>
      </div>

      {(activeLayer === 'radar' || activeLayer === 'satellite') && (
        <div className={styles.timeControls}>
          <button className={styles.ctrlBtn} onClick={() => setCurrentFrameIndex(i => Math.max(0, i - 1))}>⏮</button>
          <button className={`${styles.ctrlBtn} ${styles.playBtn}`} onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className={styles.ctrlBtn} onClick={() => setCurrentFrameIndex(i => Math.min(activeFrames.length - 1, i + 1))}>⏭</button>
          <span className={styles.timeLabel}>
            {currentFrame ? formatFrameTime(currentFrame.time) : '--:--'}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, activeFrames.length - 1)}
            value={currentFrameIndex}
            onChange={e => setCurrentFrameIndex(Number(e.target.value))}
            className={styles.frameSlider}
          />
          <span className={styles.frameType}>
            {currentFrame?.type === 'nowcast' ? t.forecastFrame : currentFrame?.type === 'satellite' ? t.satellite : t.observed}
          </span>
        </div>
      )}

      {radarError && (
      <p className={styles.radarUnavailable}>⚠️ {t.radarUnavailable}</p>
      )}

      <p className={styles.attribution}>
        {t.radarAttribution} | Map: OpenStreetMap contributors
      </p>
    </div>
  );
}
