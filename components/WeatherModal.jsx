import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ────────────────────────────────────────────────────────────────

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

const uvIndex = (clouds, dt) => {
  // rough heuristic from cloud cover since free tier has no UV endpoint
  const hour = new Date(dt * 1000).getHours();
  if (hour < 6 || hour > 18) return { val: 0, label: 'None' };
  const base = clouds < 20 ? 8 : clouds < 50 ? 5 : clouds < 80 ? 3 : 1;
  const labels = ['Low','Low','Low','Moderate','Moderate','Moderate','High','High','Very High','Extreme'];
  return { val: base, label: labels[base] ?? 'Extreme' };
};

const uvColor = (label) => ({
  None: '#94a3b8', Low: '#4ade80', Moderate: '#facc15', High: '#fb923c', 'Very High': '#f87171', Extreme: '#c084fc',
}[label] ?? '#94a3b8');

const visibilityLabel = (meters) => {
  if (meters == null) return '—';
  if (meters >= 10000) return '10+ km (Clear)';
  return `${(meters / 1000).toFixed(1)} km`;
};

// ─── Stat tile ───────────────────────────────────────────────────────────────

const Tile = ({ icon, label, value, sub, accent }) => (
  <div style={{
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }}>
    <div style={{ fontSize: '20px' }}>{icon}</div>
    <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    <div style={{ fontSize: '20px', fontWeight: 800, color: accent ?? 'white', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{sub}</div>}
  </div>
);

// ─── gradient by condition ────────────────────────────────────────────────────

const conditionGradient = (main) => {
  const map = {
    Clear:        'linear-gradient(160deg, #0f4c8a 0%, #1d6fa4 40%, #f59e0b 100%)',
    Clouds:       'linear-gradient(160deg, #1e293b 0%, #334155 50%, #64748b 100%)',
    Rain:         'linear-gradient(160deg, #0c1445 0%, #1e3a5f 50%, #2563eb 100%)',
    Drizzle:      'linear-gradient(160deg, #0f172a 0%, #1e3a5f 60%, #38bdf8 100%)',
    Thunderstorm: 'linear-gradient(160deg, #0f0f1a 0%, #1e1b4b 50%, #7c3aed 100%)',
    Snow:         'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #e2e8f0 100%)',
    Mist:         'linear-gradient(160deg, #1e293b 0%, #334155 60%, #94a3b8 100%)',
    Haze:         'linear-gradient(160deg, #1e293b 0%, #334155 60%, #d97706 100%)',
    Fog:          'linear-gradient(160deg, #1e293b 0%, #475569 80%, #cbd5e1 100%)',
  };
  return map[main] ?? 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)';
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

export default function WeatherModal({ open, onClose, weatherData, rawApiData }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    if (rawApiData) setD(rawApiData);
  }, [rawApiData]);

  if (!open) return null;

  const condition = d?.weather?.[0]?.main ?? 'Clear';
  const desc = d?.weather?.[0]?.description ?? '';
  const icon = d?.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@4x.png` : '';

  const temp = d ? Math.floor(d.main.temp) : weatherData?.temperature ?? '--';
  const feelsLike = d ? Math.floor(d.main.feels_like) : weatherData?.feelsLike ?? '--';
  const humidity = d?.main?.humidity ?? weatherData?.humidity ?? '--';
  const pressure = d?.main?.pressure;
  const visibility = d?.visibility;
  const windSpeedRaw = d?.wind?.speed;
  const windDeg = d?.wind?.deg;
  const windGust = d?.wind?.gust;
  const clouds = d?.clouds?.all;
  const sunrise = d?.sys?.sunrise;
  const sunset = d?.sys?.sunset;
  const dt = d?.dt ?? Math.floor(Date.now() / 1000);
  const city = d?.name ?? weatherData?.location ?? 'Unknown';
  const country = d?.sys?.country ?? '';
  const rain1h = d?.rain?.['1h'] ?? 0;
  const snow1h = d?.snow?.['1h'] ?? 0;
  const tempMin = d ? Math.floor(d.main.temp_min) : '--';
  const tempMax = d ? Math.floor(d.main.temp_max) : '--';
  const uv = uvIndex(clouds ?? 0, dt);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '560px',
              maxHeight: '90vh', overflowY: 'auto',
              borderRadius: '28px',
              background: conditionGradient(condition),
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
              color: 'white',
              fontFamily: "'Segoe UI', sans-serif",
              scrollbarWidth: 'none',
            }}
          >
            {/* ── Hero ── */}
            <div style={{ padding: '32px 28px 20px', position: 'relative' }}>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: '20px', right: '20px',
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '50%', width: '36px', height: '36px',
                  cursor: 'pointer', color: 'white', fontSize: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '9999'
                }}
              >✕</button>

              <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Current Weather
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '2px' }}>
                {city}{country ? `, ${country}` : ''}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.65, marginBottom: '20px' }}>
                {formatFullDate(dt)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {iconUrl && (
                  <img src={iconUrl} alt={desc} style={{ width: '90px', height: '90px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
                )}
                <div>
                  <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1 }}>{temp}°</div>
                  <div style={{ fontSize: '14px', textTransform: 'capitalize', opacity: 0.75, marginTop: '4px' }}>{desc}</div>
                  <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>
                    {tempMin}° / {tempMax}° &nbsp;·&nbsp; Feels like {feelsLike}°
                  </div>
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 28px' }} />

            {/* ── Stat grid ── */}
            <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Tile icon="💧" label="Humidity" value={`${humidity}%`} sub={humidity > 70 ? 'High — may feel muggy' : humidity < 40 ? 'Low — dry air' : 'Comfortable'} />
              <Tile icon="🌬️" label="Wind" value={`${windSpeedRaw != null ? mpsToKph(windSpeedRaw) : '--'} km/h`} sub={windDeg != null ? `From ${windDirection(windDeg)} (${windDeg}°)${windGust ? ` · Gusts ${mpsToKph(windGust)} km/h` : ''}` : undefined} />
              <Tile icon="🔵" label="Pressure" value={pressure ? `${pressure} hPa` : '—'} sub={pressure > 1013 ? 'High pressure' : pressure < 1013 ? 'Low pressure' : 'Normal'} />
              <Tile icon="👁️" label="Visibility" value={visibilityLabel(visibility)} />
              <Tile icon="☁️" label="Cloud Cover" value={clouds != null ? `${clouds}%` : '—'} sub={clouds < 20 ? 'Clear sky' : clouds < 50 ? 'Partly cloudy' : clouds < 85 ? 'Mostly cloudy' : 'Overcast'} />
              <Tile icon="🌡️" label="UV Index" value={`${uv.val} — ${uv.label}`} accent={uvColor(uv.label)} sub="Estimated from cloud cover" />
              {(rain1h > 0 || snow1h > 0) && (
                <Tile icon={rain1h > 0 ? '🌧️' : '❄️'} label={rain1h > 0 ? 'Rainfall (1h)' : 'Snowfall (1h)'} value={`${rain1h || snow1h} mm`} />
              )}
            </div>

            {/* ── Sun times ── */}
            {(sunrise || sunset) && (
              <div style={{ padding: '0 28px 20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', display: 'flex', justifyContent: 'space-around' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🌅</div>
                    <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sunrise</div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{sunrise ? formatTime(sunrise) : '—'}</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>🌇</div>
                    <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sunset</div>
                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{sunset ? formatTime(sunset) : '—'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Footer ── */}
            <div style={{ padding: '0 28px 24px', fontSize: '11px', opacity: 0.4, textAlign: 'center' }}>
              Updated {formatTime(dt)} · OpenWeatherMap
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}