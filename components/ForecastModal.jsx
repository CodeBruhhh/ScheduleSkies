import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/forecastModal.module.css';

// ─── helpers ─────────────────────────────────────────────────────────────────

const mpsToKph = (mps) => (mps * 3.6).toFixed(1);

const formatTime = (unix) =>
  new Date(unix * 1000).toLocaleTimeString('en-PH', {
    timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit', hour12: true,
  });

const formatDayLabel = (unix) => {
  const d        = new Date(unix * 1000);
  const today    = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString())    return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila', weekday: 'long', month: 'short', day: 'numeric',
  });
};

const groupByDay = (list) => {
  const groups = {};
  list.forEach(item => {
    const key = new Date(item.dt * 1000).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).map(([date, items]) => ({ date, items }));
};

const conditionTextColor = (main) => ({
  Clear: '#f59e0b', Clouds: '#64748b', Rain: '#3b82f6',
  Drizzle: '#38bdf8', Thunderstorm: '#7c3aed', Snow: '#94a3b8',
  Mist: '#94a3b8', Haze: '#d97706', Fog: '#94a3b8',
}[main] ?? '#4396d1');

// ─── Single hour row ──────────────────────────────────────────────────────────

function HourRow({ item, isLast }) {
  const temp      = Math.floor(item.main.temp);
  const feelsLike = Math.floor(item.main.feels_like);
  const desc      = item.weather?.[0]?.description ?? '';
  const main      = item.weather?.[0]?.main ?? '';
  const icon      = item.weather?.[0]?.icon;
  const iconUrl   = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';
  const pop       = Math.round((item.pop ?? 0) * 100);
  const wind      = mpsToKph(item.wind?.speed ?? 0);
  const humidity  = item.main?.humidity ?? '--';

  return (
    <div className={styles.hourRow} style={isLast ? { borderBottom: 'none' } : undefined}>
      <div className={styles.hourTime}>{formatTime(item.dt)}</div>
      <div>
        {iconUrl && <img src={iconUrl} alt={desc} className={styles.hourIcon} />}
      </div>
      <div className={styles.hourDetails}>
        <div className={styles.hourDesc} style={{ color: conditionTextColor(main) }}>{desc}</div>
        <div className={styles.hourMeta}>
          {pop > 0 && <span className={styles.hourMetaItem}>💧 {pop}%</span>}
          <span className={styles.hourMetaItem}>🌬️ {wind} km/h</span>
          <span className={styles.hourMetaItem}>💦 {humidity}%</span>
        </div>
      </div>
      <div className={styles.hourTempBlock}>
        <div className={styles.hourTemp}>{temp}°</div>
        <div className={styles.hourFeels}>feels {feelsLike}°</div>
      </div>
    </div>
  );
}

// ─── Day accordion card ───────────────────────────────────────────────────────

function DayCard({ items, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  const temps    = items.map(i => i.main.temp);
  const minTemp  = Math.floor(Math.min(...temps));
  const maxTemp  = Math.floor(Math.max(...temps));
  const midItem  = items[Math.floor(items.length / 2)];
  const midIcon  = midItem?.weather?.[0]?.icon;
  const midIconUrl = midIcon ? `https://openweathermap.org/img/wn/${midIcon}@2x.png` : '';
  const maxPop   = Math.round(Math.max(...items.map(i => i.pop ?? 0)) * 100);
  const label    = formatDayLabel(items[0].dt);

  return (
    <div className={styles.dayCard}>
      <button className={styles.dayHeader} onClick={() => setOpen(v => !v)}>
        <div className={styles.dayHeaderLeft}>
          <div className={styles.dayName}>{label}</div>
          <div className={styles.dayMeta}>
            {minTemp}° / {maxTemp}°{maxPop > 0 ? `  ·  💧 ${maxPop}%` : ''}
          </div>
        </div>
        {midIconUrl && <img src={midIconUrl} alt="" className={styles.dayIcon} />}
        <span className={`${styles.dayChevron}${open ? ` ${styles.dayChevronOpen}` : ''}`}>›</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.rowsWrap}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <div className={styles.rowsInner}>
              {items.map((item, idx) => (
                <HourRow key={item.dt} item={item} isLast={idx === items.length - 1} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function ForecastModal({ open, onClose, forecastItem, allForecastRaw }) {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (allForecastRaw?.list) {
      setGroups(groupByDay(allForecastRaw.list));
    }
  }, [allForecastRaw]);

  const city    = allForecastRaw?.city?.name    ?? '';
  const country = allForecastRaw?.city?.country ?? '';

  // Which day to open by default — matches the clicked card's day
  const clickedDayDate = forecastItem
    ? new Date(forecastItem.dt * 1000).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })
    : null;

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
            {/* Sticky header */}
            <div className={styles.header}>
              <div className={styles.headerText}>
                <div className={styles.headerEyebrow}>5-Day Forecast</div>
                <div className={styles.headerCity}>
                  {city}{country ? `, ${country}` : ''}
                </div>
                <div className={styles.headerHint}>3-hour intervals · tap a day to expand</div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            {/* Day accordion list */}
            <div className={styles.body}>
              {groups.length === 0 ? (
                <div className={styles.empty}>No forecast data available.</div>
              ) : (
                groups.map(({ date, items }) => (
                  <DayCard
                    key={date}
                    items={items}
                    defaultOpen={
                      date === clickedDayDate ||
                      (!clickedDayDate && date === groups[0]?.date)
                    }
                  />
                ))
              )}
            </div>

            <div className={styles.footer}>
              OpenWeatherMap · 5-day / 3-hour forecast
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}