import { useEffect, useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { SelectedLocation } from '../../types/location';
import type { HourlyForecastItem } from '../../types/weather';
import { buildSmoothAnimationFrames } from '../../services/weatherMapAnimationService';
import type { OverlayBlob, OverlayChannel } from '../../utils/weatherOverlayGenerator';
import { generateOrganicBlobOutline } from '../../utils/organicBlobShape';
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

// The forecast-based overlay animation ('none' hides it entirely).
type ActiveLayer = 'none' | OverlayChannel;

// 60 interpolated frames spanning a ~15s, now..+6h window.
// 255ms * 59 transitions ≈ 15.05s total playback.
const ANIMATION_INTERVAL_MS = 255;

export function ForecastMap({ location, hours }: Props) {
  const { t } = useLanguage();
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('auto');
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const overlayChannel: OverlayChannel = activeLayer === 'none' ? 'auto' : activeLayer;
  const animationFrames = useMemo(
    () => buildSmoothAnimationFrames(hours, location, overlayChannel),
    [hours, location, overlayChannel]
  );

  const showOverlay = activeLayer !== 'none';

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

  const handleSetLayer = useCallback((layer: ActiveLayer) => {
    setActiveLayer(layer);
    setIsPlaying(false);
    setCurrentAnimationFrame(0);
  }, []);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const currentFrameData = animationFrames[currentAnimationFrame];
  const currentHourOffset = currentFrameData?.hourOffset ?? 0;
  const frameLabel = currentHourOffset === 0
    ? t.nowLabel
    : t.hourLabel.replace('{n}', String(currentHourOffset));

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
          <button className={styles.layerBtn} disabled title="coming soon">{t.snowLayer}<span className={styles.soon}> {t.comingSoon}</span></button>
          <button className={styles.layerBtn} disabled title="coming soon">{t.windLayer}<span className={styles.soon}> {t.comingSoon}</span></button>
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
          {showOverlay && currentFrameData?.blobs.map(blob => {
            const isRain = blob.intensity.endsWith('rain');
            const popupInfo = getBlobPopupInfo(blob, t);
            // Organic, radar-like outline instead of a perfect circle: an
            // outer, larger, lower-opacity polygon fakes a soft/blurred
            // edge, while the inner polygon (which carries the popup) is
            // the higher-opacity "core" of the precipitation patch. Both
            // are jittered deterministically from the blob's stable id, so
            // the shape stays visually consistent frame-to-frame - only its
            // center/size/opacity move via interpolation.
            const outerOutline = generateOrganicBlobOutline(blob.lat, blob.lng, blob.radiusMeters, `${blob.id}-outer`, 1.25);
            const innerOutline = generateOrganicBlobOutline(blob.lat, blob.lng, blob.radiusMeters, `${blob.id}-inner`, 0.85);
            return (
              <LayerGroup key={blob.id}>
                <Polygon
                  positions={outerOutline}
                  interactive={false}
                  pathOptions={{
                    color: blob.color,
                    fillColor: blob.color,
                    fillOpacity: blob.opacity * 0.45,
                    stroke: false,
                  }}
                />
                <Polygon
                  positions={innerOutline}
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
                </Polygon>
              </LayerGroup>
            );
          })}
        </MapContainer>
      </div>

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

      <p className={styles.attribution}>
        {t.mapDataAttribution}
      </p>
    </div>
  );
}
