import React, { useEffect, useState } from 'react'
import styles from '../styles/forecast.module.css'
import { getLocationWithFallback } from '@/lib/getLocation'

export default function ForecastCards({ onRawData, onCardClick }) {
  const [forecastData, setForecastData] = useState([])
  const [rawItems, setRawItems] = useState([])   // raw API items parallel to forecastData
  const [loading, setLoading] = useState(true)

  const CACHE_TTL = 1000 * 60 * 15
  const CACHE_KEY = 'forecast_cache'
  const RAW_CACHE_KEY = 'forecast_raw_cache'

  const getForecastData = async () => {
    const { lat, lon } = await getLocationWithFallback()

    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
      const rawCached = JSON.parse(sessionStorage.getItem(RAW_CACHE_KEY))
      if (cached && rawCached && Date.now() - cached.timestamp < CACHE_TTL) {
        setForecastData(cached.data)
        setRawItems(rawCached.items ?? [])   // restore raw items
        onRawData?.(rawCached.full)          // restore full response for modal
        setLoading(false)
        return
      }
    } catch (_) {}

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
    try {
      setLoading(true)
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !Array.isArray(data?.list)) {
        throw new Error(data?.message || 'Forecast API returned invalid response')
      }

      // Pass full raw response up to dashboard
      onRawData?.(data)

      const sliced = data.list.slice(0, 4)

      const forecastArray = sliced.map(item => ({
        time: new Date((item?.dt ?? 0) * 1000).toLocaleTimeString('en-PH', {
          timeZone: 'Asia/Manila', hour: 'numeric', hour12: true,
        }),
        temp: Math.floor(item?.main?.temp ?? 0),
        iconUrl: item?.weather?.[0]?.icon
          ? `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
          : '',
        description: item?.weather?.[0]?.description || 'No data',
      }))

      // Cache parsed display data + raw items separately
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: forecastArray, timestamp: Date.now() }))
      sessionStorage.setItem(RAW_CACHE_KEY, JSON.stringify({
        items: sliced,      // raw items for card clicks
        full: data,         // full response for modal day-grouping
        timestamp: Date.now(),
      }))

      setForecastData(forecastArray)
      setRawItems(sliced)
    } catch (error) {
      console.error('Forecast fetch failed:', error)
      setForecastData([])
      setRawItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { getForecastData() }, [])

  return (
    <div className={styles.container}>
      <p>TODAY'S FORECAST</p>
      {loading ? (
        <div className="spinner-container"><div className="loading-spinner" /></div>
      ) : (
        <div className={styles.cardContainer}>
          {forecastData.map((h, idx) => (
            <div
              key={idx}
              className={styles.card}
              onClick={() => onCardClick?.(rawItems[idx] ?? null)}
              style={{ cursor: 'pointer', transition: 'transform 0.15s, opacity 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.opacity = '0.88' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1' }}
              title="Click for full forecast"
            >
              <div className={styles.time}>{h.time}</div>
              <div className={styles.icon}>
                {h.iconUrl && <img src={h.iconUrl} alt="weather icon" />}
              </div>
              <div className={styles.temp}>{h.temp}°C</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}