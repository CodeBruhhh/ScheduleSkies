import React from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h2>Smart Travel Planning</h2>
        <p>Plan your trips based on real-time weather and traffic predictions</p>
        <Link href="/plan">
          <button className="cta-button">Get Started</button>
        </Link>
      </div>
    </section>
  )
}
