import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/weatherModal.module.css';

// ─── helpers ─────────────────────────────────────────────────────────────────

const windDirection = (deg) => {
  if (deg == null) return '—';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

const mpsToKph = (mps) => (mps * 3.6).toFixed(1);

const formatTime = (unix) =>
  new Date(unix * 1000).toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', hour12: true,
  });

const formatFullDate = (unix) =>
  new Date(unix * 1000).toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

const uvEstimate = (clouds, dt) => {
  const hour = new Date(dt * 1000).getHours();
  if (hour < 6 || hour > 18) return { val: 0, label: 'None' };
  const base = clouds < 20 ? 8 : clouds < 50 ? 5 : clouds < 80 ? 3 : 1;
  const labels = ['Low','Low','Low','Moderate','Moderate','Moderate','High','High','Very High','Extreme'];
  return { val: base, label: labels[base] ?? 'Extreme' };
};

const visibilityLabel = (m) => {
  if (m == null) return '—';
  return m >= 10000 ? '10+ km (Clear)' : `${(m / 1000).toFixed(1)} km`;
};

const uvColors = {
  None: '#94a3b8', Low: '#22c55e', Moderate: '#f59e0b',
  High: '#f97316', 'Very High': '#ef4444', Extreme: '#a855f7',
};

// ─── Tile ─────────────────────────────────────────────────────────────────────

function Tile({ icon, label, value, sub, accentColor }) {
  return (
    <div className={styles.tile}>
      <div className={styles.tileIcon}>{icon}</div>
      <div className={styles.tileLabel}>{label}</div>
      <div className={styles.tileValue} style={accentColor ? { color: accentColor } : undefined}>
        {value}
      </div>
      {sub && <div className={styles.tileSub}>{sub}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function WeatherModal({ open, onClose, rawApiData }) {
  const d = rawApiData;

  const condition  = d?.weather?.[0]?.main ?? '';
  const desc       = d?.weather?.[0]?.description ?? '';
  const icon       = d?.weather?.[0]?.icon;
  const iconUrl    = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : '';

  const temp       = d ? Math.floor(d.main.temp)       : '--';
  const feelsLike  = d ? Math.floor(d.main.feels_like) : '--';
  const tempMin    = d ? Math.floor(d.main.temp_min)   : '--';
  const tempMax    = d ? Math.floor(d.main.temp_max)   : '--';
  const humidity   = d?.main?.humidity ?? '--';
  const pressure   = d?.main?.pressure;
  const visibility = d?.visibility;
  const windSpeed  = d?.wind?.speed;
  const windDeg    = d?.wind?.deg;
  const windGust   = d?.wind?.gust;
  const clouds     = d?.clouds?.all ?? 50;
  const sunrise    = d?.sys?.sunrise;
  const sunset     = d?.sys?.sunset;
  const dt         = d?.dt ?? Math.floor(Date.now() / 1000);
  const city       = d?.name ?? '—';
  const country    = d?.sys?.country ?? '';
  const rain1h     = d?.rain?.['1h'] ?? 0;
  const snow1h     = d?.snow?.['1h'] ?? 0;
  const uv         = uvEstimate(clouds, dt);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.sheet}
            initial={{ scale: 0.92, opacity: 0, y: 28 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            exit={{   scale: 0.92, opacity: 0, y: 28 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Hero */}
            <div className={styles.hero}>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
              <div className={styles.heroLabel}>Current Weather</div>
              <div className={styles.heroCity}>{city}{country ? `, ${country}` : ''}</div>
              <div className={styles.heroDate}>{formatFullDate(dt)}</div>
              <div className={styles.heroMain}>
                {iconUrl && <img src={iconUrl} alt={desc} className={styles.heroIcon} />}
                <div>
                  <div className={styles.heroTemp}>{temp}°</div>
                  <div className={styles.heroDesc}>{desc || condition}</div>
                  <div className={styles.heroSub}>
                    {tempMin}° / {tempMax}° · Feels like {feelsLike}°
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Stats */}
            <div className={styles.grid}>
              <Tile
                icon="💧" label="Humidity" value={`${humidity}%`}
                sub={humidity > 70 ? 'High — may feel muggy' : humidity < 40 ? 'Low — dry air' : 'Comfortable'}
              />
              <Tile
                icon="🌬️" label="Wind"
                value={windSpeed != null ? `${mpsToKph(windSpeed)} km/h` : '—'}
                sub={windDeg != null
                  ? `From ${windDirection(windDeg)} (${windDeg}°)${windGust ? ` · Gusts ${mpsToKph(windGust)} km/h` : ''}`
                  : undefined}
              />
              <Tile
                icon="🔵" label="Pressure"
                value={pressure ? `${pressure} hPa` : '—'}
                sub={pressure > 1013 ? 'High pressure' : pressure < 1013 ? 'Low pressure' : 'Normal'}
              />
              <Tile icon="👁️" label="Visibility" value={visibilityLabel(visibility)} />
              <Tile
                icon="☁️" label="Cloud Cover"
                value={clouds != null ? `${clouds}%` : '—'}
                sub={clouds < 20 ? 'Clear sky' : clouds < 50 ? 'Partly cloudy' : clouds < 85 ? 'Mostly cloudy' : 'Overcast'}
              />
              <Tile
                icon="☀️" label="UV Index (est.)"
                value={`${uv.val} — ${uv.label}`}
                accentColor={uvColors[uv.label]}
                sub="Estimated from cloud cover"
              />
              {(rain1h > 0 || snow1h > 0) && (
                <Tile
                  icon={rain1h > 0 ? '🌧️' : '❄️'}
                  label={rain1h > 0 ? 'Rainfall (1h)' : 'Snowfall (1h)'}
                  value={`${rain1h || snow1h} mm`}
                />
              )}
            </div>

            {/* Sunrise / Sunset */}
            {(sunrise || sunset) && (
              <div className={styles.sunRow}>
                <div className={styles.sunItem}>
                  <div className={styles.sunEmoji}>🌅</div>
                  <div className={styles.sunLabel}>Sunrise</div>
                  <div className={styles.sunTime}>{sunrise ? formatTime(sunrise) : '—'}</div>
                </div>
                <div className={styles.sunDivider} />
                <div className={styles.sunItem}>
                  <div className={styles.sunEmoji}>🌇</div>
                  <div className={styles.sunLabel}>Sunset</div>
                  <div className={styles.sunTime}>{sunset ? formatTime(sunset) : '—'}</div>
                </div>
              </div>
            )}

            <div className={styles.footer}>
              Updated {formatTime(dt)} · OpenWeatherMap
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}