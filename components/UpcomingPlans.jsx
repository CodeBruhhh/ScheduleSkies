import React from 'react'
import styles from '../styles/upcoming.module.css'
import { FaMapMarkerAlt } from 'react-icons/fa'

export default function UpcomingPlans({ plans = [] }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Upcoming Plans</h3>
        <a href="#">View All →</a>
      </div>
      <ul className={styles.list}>
        {plans.map((p, idx) => (
          <li key={idx} className={styles.plan}>
            <div className={styles.date}>{p.date}</div>
            <div className={styles.title}>{p.title}</div>
            <div className={styles.location}>
              <FaMapMarkerAlt /> {p.location} • {p.distance} away
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
