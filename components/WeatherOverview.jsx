import React from 'react'
import styles from '../styles/weather.module.css'

export default function WeatherOverview({ username = 'User', weather = {} }) {
  const date = new Date()
  const options = { month: 'long', day: 'numeric', weekday: 'long' }
  const formattedDate = date.toLocaleDateString(undefined, options)

  const { temperature = 37, feelsLike = 40, humidity = 75, precipitation = 10, wind = '10km/h' } = weather

  return (
    <div className={styles.overview}>
      <h1 className={styles.greeting}>Welcome Back, {username}</h1>
      <p className={styles.date}>{formattedDate}</p>
      <div className={styles.temperature}>{temperature}°C</div>
      <p className={styles.feels}>Feels like {feelsLike}°C</p>
      <div className={styles.metrics}>
        <div>Humidity: {humidity}%</div>
        <div>Precipitation: {precipitation}%</div>
        <div>Wind: {wind}</div>
      </div>
    </div>
  )
}
