import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── helpers ─────────────────────────────────────────────────────────────────

const mpsToKph = (mps) => (mps * 3.6).toFixed(1);

const formatDayLabel = (unix) => {
  const d = new Date(unix * 1000);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila', weekday: 'long', month: 'short', day: 'numeric',
  });
};

const formatTime = (unix) =>
  new Date(unix * 1000).toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true,
  });

const groupByDay = (list) => {
  const groups = {};
  list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
};

const conditionColor = (main) => ({
  Clear: '#f59e0b', Clouds: '#94a3b8', Rain: '#38bdf8',
  Drizzle: '#7dd3fc', Thunderstorm: '#a78bfa', Snow: '#e2e8f0',
  Mist: '#cbd5e1', Haze: '#d97706', Fog: '#cbd5e1',
}[main] ?? '#94a3b8');

// ─── hourly row inside a day ──────────────────────────────────────────────────

const HourRow = ({ item, isLast }) => {
  const temp = Math.floor(item.main.temp);
  const feelsLike = Math.floor(item.main.feels_like);
  const desc = item.weather?.[0]?.description ?? '';
  const icon = item.weather?.[0]?.icon;
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';
  const main = item.weather?.[0]?.main ?? '';
  const pop = Math.round((item.pop ?? 0) * 100);
  const windKph = mpsToKph(item.wind?.speed ?? 0);
  const humidity = item.main?.humidity;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '70px 48px 1fr auto',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 0',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Time */}
      <div style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
        {formatTime(item.dt)}
      </div>

      {/* Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {iconUrl && <img src={iconUrl} alt={desc} style={{ width: '40px', height: '40px' }} />}
      </div>

      {/* Details */}
      <div>
        <div style={{ fontSize: '13px', textTransform: 'capitalize', color: conditionColor(main), fontWeight: 600 }}>{desc}</div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '3px', flexWrap: 'wrap' }}>
          {pop > 0 && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>💧 {pop}%</span>
          )}
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>🌬️ {windKph} km/h</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>💦 {humidity}%</span>
        </div>
      </div>

      {/* Temp */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '20px', fontWeight: 900 }}>{temp}°</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>feels {feelsLike}°</div>
      </div>
    </div>
  );
};

// ─── Day section ──────────────────────────────────────────────────────────────

const DaySection = ({ date, items, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  // compute day summary
  const temps = items.map(i => i.main.temp);
  const minTemp = Math.floor(Math.min(...temps));
  const maxTemp = Math.floor(Math.max(...temps));
  const dominantCondition = items[Math.floor(items.length / 2)]?.weather?.[0]?.main ?? '';
  const dominantIcon = items[Math.floor(items.length / 2)]?.weather?.[0]?.icon;
  const dominantIconUrl = dominantIcon ? `https://openweathermap.org/img/wn/${dominantIcon}@2x.png` : '';
  const maxPop = Math.round(Math.max(...items.map(i => i.pop ?? 0)) * 100);
  const label = formatDayLabel(items[0].dt);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '18px',
      overflow: 'hidden',
      marginBottom: '10px',
    }}>
      {/* Header — clickable to expand */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'grid', gridTemplateColumns: '1fr 48px auto',
          alignItems: 'center', gap: '12px',
          padding: '14px 18px',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '15px', fontWeight: 800 }}>{label}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
            {minTemp}° / {maxTemp}°
            {maxPop > 0 ? `  ·  💧 ${maxPop}%` : ''}
          </div>
        </div>
        {dominantIconUrl && (
          <img src={dominantIconUrl} alt={dominantCondition} style={{ width: '40px', height: '40px' }} />
        )}
        <div style={{ fontSize: '18px', opacity: 0.5, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ›
        </div>
      </button>

      {/* Expanded hourly rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 6px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {items.map((item, idx) => (
                <HourRow key={item.dt} item={item} isLast={idx === items.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function ForecastModal({ open, onClose, forecastItem, allForecastRaw }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (allForecastRaw?.list) {
      setGroups(groupByDay(allForecastRaw.list));
    }
  }, [allForecastRaw]);

  if (!open) return null;

  const cityName = allForecastRaw?.city?.name ?? '';
  const country = allForecastRaw?.city?.country ?? '';

  // if opened from a specific card, find that card's day to open by default
  const clickedDayDate = forecastItem
    ? new Date(forecastItem.dt * 1000).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
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
              background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
              color: 'white',
              fontFamily: "'Segoe UI', sans-serif",
              scrollbarWidth: 'none',
            }}
          >
            {/* Header */}
            <div style={{ padding: '28px 24px 16px', position: 'sticky', top: 0, zIndex: 2, background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 80%)', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>5-Day Forecast</div>
                  <div style={{ fontSize: '20px', fontWeight: 800 }}>
                    {cityName}{country ? `, ${country}` : ''}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.45, marginTop: '3px' }}>3-hour intervals · tap a day to expand</div>
                </div>
                <button
                  onClick={onClose}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            </div>

            {/* Day sections */}
            <div style={{ padding: '8px 20px 28px' }}>
              {groups.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.4 }}>No forecast data available</div>
              ) : (
                groups.map(({ date, items }) => (
                  <DaySection
                    key={date}
                    date={date}
                    items={items}
                    defaultOpen={date === clickedDayDate || (!clickedDayDate && date === groups[0].date)}
                  />
                ))
              )}
            </div>

            <div style={{ padding: '0 24px 20px', fontSize: '11px', opacity: 0.3, textAlign: 'center' }}>
              OpenWeatherMap · 5-day / 3-hour forecast
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}