import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { SelectedLocation } from '../../types/location';
import type { HourlyForecastItem } from '../../types/weather';
import {
  fetchRainViewerData,
  getRadarTileUrl,
  formatFrameTime,
  RAINVIEWER_MAX_NATIVE_ZOOM,
  type RainViewerData,
  type RadarFrame,
} from '../../services/radarService';
import { buildAnimationFrames } from '../../services/weatherMapAnimationService';
import type { OverlayBlob, OverlayChannel } from '../../utils/weatherOverlayGenerator';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Translations } from '../../i18n/translations';
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
  hours?: HourlyForecastItem[];
}

/** Emoji + translated label shown in each overlay blob's popup. */
function getBlobPopupInfo(blob: OverlayBlob, t: Translations): { icon: string; label: string; valueText: string } {
  switch (blob.intensity) {
    case 'snow':
      return { icon: '❄️', label: t.intensitySnow, valueText: blob.valueMmPerHour !== undefined ? `${blob.valueMmPerHour.toFixed(1)} cm/h` : '' };
    case 'light-rain':
      return { icon: '🌧️', label: t.intensityLightRain, valueText: blob.valueMmPerHour !== undefined ? `${blob.valueMmPerHour.toFixed(1)} mm/h` : '' };
    case 'moderate-rain':
      return { icon: '🌧️', label: t.intensityModerateRain, valueText: blob.valueMmPerHour !== undefined ? `${blob.valueMmPerHour.toFixed(1)} mm/h` : '' };
    case 'heavy-rain':
      return { icon: '🌧️', label: t.intensityHeavyRain, valueText: blob.valueMmPerHour !== undefined ? `${blob.valueMmPerHour.toFixed(1)} mm/h` : '' };
    case 'very-heavy-rain':
      return { icon: '⛈️', label: t.intensityVeryHeavyRain, valueText: blob.valueMmPerHour !== undefined ? `${blob.valueMmPerHour.toFixed(1)} mm/h` : '' };
    case 'cloud':
    default:
      return { icon: '☁️', label: t.intensityCloud, valueText: blob.valueMmPerHour !== undefined ? `${Math.round(blob.valueMmPerHour)}%` : '' };
  }
}

// 'radar' is the optional live RainViewer tile layer; the rest are channels
// of the simulated forecast-based overlay animation (see weatherOverlayGenerator).
type ActiveLayer = 'none' | 'radar' | OverlayChannel;

const ANIMATION_INTERVAL_MS = 2600;

export function ForecastMap({ location, hours }: Props) {
  const { t } = useLanguage();
  const [rainviewerData, setRainviewerData] = useState<RainViewerData | null>(null);
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('auto');
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentRadarFrameIndex, setCurrentRadarFrameIndex] = useState(0);
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
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
        setRadarFrames(radar);
        setCurrentRadarFrameIndex(Math.max(0, data.radar.past.length - 1));
      })
      .catch(() => setRadarError(true));
  }, []);

  // Channel used by the forecast overlay animation ('none'/'radar' don't need one).
  const overlayChannel: OverlayChannel = activeLayer === 'none' || activeLayer === 'radar' ? 'auto' : activeLayer;
  const animationFrames = useMemo(
    () => buildAnimationFrames(hours, location, overlayChannel),
    [hours, location, overlayChannel]
  );

  const showOverlay = activeLayer !== 'none' && activeLayer !== 'radar';
  const showRadar = activeLayer === 'radar';

  // Reset the scrubber whenever the frame set changes (e.g. new location/hours).
  useEffect(() => {
    setCurrentAnimationFrame(0);
    setIsPlaying(false);
  }, [animationFrames]);

  useEffect(() => {
    if (!isPlaying || !showOverlay) return;
    if (animationFrames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAnimationFrame(prev => {
        if (prev >= animationFrames.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, ANIMATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPlaying, showOverlay, animationFrames.length]);

  useEffect(() => {
    if (!isPlaying || !showRadar) return;
    if (radarFrames.length === 0) return;
    const interval = setInterval(() => {
      setCurrentRadarFrameIndex(prev => (prev + 1) % radarFrames.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying, showRadar, radarFrames]);

  const handleSetLayer = useCallback((layer: ActiveLayer) => {
    setActiveLayer(layer);
    setIsPlaying(false);
    if (layer === 'radar') {
      const nowcastStart = radarFrames.findIndex(f => f.type === 'nowcast');
      setCurrentRadarFrameIndex(nowcastStart > -1 ? nowcastStart : Math.max(0, radarFrames.length - 1));
    } else {
      setCurrentAnimationFrame(0);
    }
  }, [radarFrames]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const currentRadarFrame = radarFrames[currentRadarFrameIndex];
  const currentFrameData = animationFrames[currentAnimationFrame];
  const frameLabel = currentAnimationFrame === 0
    ? t.nowLabel
    : t.hourLabel.replace('{n}', String(currentAnimationFrame));

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
            className={`${styles.layerBtn} ${activeLayer === 'auto' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('auto')}
          >{t.rainLayer}</button>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'cloud' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('cloud')}
          >{t.cloudsLayer}</button>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'snow' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('snow')}
          >{t.snowLayer}</button>
          <button className={styles.layerBtn} disabled title="coming soon">{t.windLayer}<span className={styles.soon}> {t.comingSoon}</span></button>
          <button
            className={`${styles.layerBtn} ${activeLayer === 'radar' ? styles.layerActive : ''}`}
            onClick={() => handleSetLayer('radar')}
          >{t.rainRadar}</button>
        </div>
      </div>

      <p className={styles.disclaimer}>{t.mapDisclaimer}</p>

      <div className={styles.mapWrapper}>
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={10}
          className={styles.map}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            maxNativeZoom={20}
          />
          <RecenterMap lat={location.latitude} lon={location.longitude} />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <strong>{location.displayName || location.name}</strong><br />
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </Popup>
          </Marker>
          {showRadar && currentRadarFrame && rainviewerData && (
            <TileLayer
              key={`radar-${currentRadarFrame.time}`}
              url={getRadarTileUrl(rainviewerData.host, currentRadarFrame.path)}
              opacity={0.7}
              attribution="RainViewer"
              zIndex={2}
              maxNativeZoom={RAINVIEWER_MAX_NATIVE_ZOOM}
            />
          )}
          {showOverlay && currentFrameData?.blobs.map(blob => {
            const isRain = blob.intensity.endsWith('rain');
            const popupInfo = getBlobPopupInfo(blob, t);
            return (
              <Circle
                key={blob.id}
                center={[blob.lat, blob.lng]}
                radius={blob.radiusMeters}
                pathOptions={{
                  color: blob.color,
                  fillColor: blob.color,
                  fillOpacity: blob.opacity,
                  stroke: false,
                  className: isRain ? styles.rainStreak : undefined,
                }}
              >
                <Popup>
                  {popupInfo.icon} {popupInfo.label}
                  {popupInfo.valueText ? ` — ${popupInfo.valueText}` : ''} {t.overlayForecastSuffix}
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {showRadar && (
        <div className={styles.timeControls}>
          <button className={styles.ctrlBtn} onClick={() => setCurrentRadarFrameIndex(i => Math.max(0, i - 1))}>⏮</button>
          <button className={`${styles.ctrlBtn} ${styles.playBtn}`} onClick={togglePlay} aria-label={isPlaying ? t.pauseAnimation : t.playAnimation}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className={styles.ctrlBtn} onClick={() => setCurrentRadarFrameIndex(i => Math.min(radarFrames.length - 1, i + 1))}>⏭</button>
          <span className={styles.timeLabel}>
            {currentRadarFrame ? formatFrameTime(currentRadarFrame.time) : '--:--'}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, radarFrames.length - 1)}
            value={currentRadarFrameIndex}
            onChange={e => setCurrentRadarFrameIndex(Number(e.target.value))}
            className={styles.frameSlider}
          />
          <span className={styles.frameType}>
            {currentRadarFrame?.type === 'nowcast' ? t.forecastFrame : t.observed}
          </span>
        </div>
      )}

      {showOverlay && animationFrames.length > 0 && (
        <div className={styles.timeControls}>
          <button
            className={`${styles.ctrlBtn} ${styles.playBtn}`}
            onClick={togglePlay}
            aria-label={isPlaying ? t.pauseAnimation : t.playAnimation}
            disabled={currentAnimationFrame >= animationFrames.length - 1 && !isPlaying}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <span className={styles.timeLabel}>{frameLabel}</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, animationFrames.length - 1)}
            value={currentAnimationFrame}
            onChange={e => {
              setIsPlaying(false);
              setCurrentAnimationFrame(Number(e.target.value));
            }}
            className={styles.frameSlider}
          />
          <span className={styles.frameType}>{t.forecastFrame}</span>
        </div>
      )}

      {showOverlay && animationFrames.length === 0 && (
        <p className={styles.radarUnavailable}>⚠️ {t.noOverlayData}</p>
      )}

      {radarError && showRadar && (
        <p className={styles.radarUnavailable}>⚠️ {t.radarUnavailable}</p>
      )}

      <p className={styles.attribution}>
        {t.radarAttribution} | Map: CARTO Voyager, OpenStreetMap contributors
      </p>
    </div>
  );
}
