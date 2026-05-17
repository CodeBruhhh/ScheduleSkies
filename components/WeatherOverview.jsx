import React, { useEffect, useState } from 'react'
import styles from '../styles/weather.module.css'
import { getLocationWithFallback } from '@/lib/getLocation'

export default function WeatherOverview({ username = 'User', weather = {}, onRawData, onCardClick }) {
  const date = new Date()
  const formattedDate = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' })
  const [loading, setLoading] = useState(true)

  const [weatherData, setWeatherData] = useState({
    location: 'Cebu City',
    temperature: weather.temperature ?? '--',
    feelsLike: weather.feelsLike ?? '--',
    humidity: weather.humidity ?? '--',
    windSpeed: weather.wind ?? '--',
    precipitation: weather.precipitation ?? 0,
  })

  const CACHE_TTL = 1000 * 60 * 15
  const CACHE_KEY = 'weather_cache'
  const RAW_CACHE_KEY = 'weather_raw_cache'

  const getWeatherData = async () => {
    const { lat, lon } = await getLocationWithFallback()

    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
      const rawCached = JSON.parse(sessionStorage.getItem(RAW_CACHE_KEY))
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setWeatherData(cached.data)
        if (rawCached?.data) onRawData?.(rawCached.data)
        setLoading(false)
        return
      }
    } catch (_) {}

    try {
      setLoading(true)
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok || !data?.main) throw new Error(data?.message || 'Invalid response')

      // Pass raw data up to dashboard for the modal
      onRawData?.(data)
      sessionStorage.setItem(RAW_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))

      const parsed = {
        location: data.name || 'Cebu City',
        temperature: Math.floor(data.main.temp),
        feelsLike: Math.floor(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed ?? 0,
        precipitation: data.rain?.['1h'] ?? data.snow?.['1h'] ?? 0,
      }

      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: parsed, timestamp: Date.now() }))
      setWeatherData(parsed)
    } catch (error) {
      console.error('Weather fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { getWeatherData() }, [])

  return (
    <div
      className={styles.overview}
      onClick={() => !loading && onCardClick?.()}
      style={{ cursor: loading ? 'default' : 'pointer', transition: 'opacity 0.15s' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
      title={loading ? undefined : 'Click for detailed weather info'}
    >
      <h1 className={styles.greeting}>Welcome Back, {username}</h1>
      <div className={styles.weatherContainer}>
        <div className={styles.temperatureContainer}>
          {loading ? (
            <div className="spinner-container"><div className="loading-spinner" /></div>
          ) : (
            <>
              <p className={styles.location_and_date}>{weatherData.location}</p>
              <p className={styles.location_and_date}>{formattedDate}</p>
              <div className={styles.temperature}>{weatherData.temperature}°C</div>
              <p className={styles.feels}>Feels like {weatherData.feelsLike}°C</p>
            </>
          )}
        </div>
        <div className={styles.metrics}>
          {loading ? (
            <div className="spinner-container"><div className="loading-spinner" /></div>
          ) : (
            <>
              <div className={styles.metricsContainer}>Humidity: {weatherData.humidity}%</div>
              <div className={styles.metricsContainer}>Precipitation: {weatherData.precipitation} mm</div>
              <div className={styles.metricsContainer}>Wind: {weatherData.windSpeed} km/h</div>
              <div style={{ fontSize: '11px', opacity: 0.45, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                Tap for full details
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}