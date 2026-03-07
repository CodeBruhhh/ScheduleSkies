import React from 'react'

export default function Features() {
  const features = [
    {
      title: 'Weather Analysis',
      description: 'Real-time weather forecasts to choose the best time to travel'
    },
    {
      title: 'Traffic Prediction',
      description: 'Intelligent traffic forecasts to avoid delays and congestion'
    },
    {
      title: 'Route Optimization',
      description: 'Find optimal routes that match your preferences and schedule'
    },
    {
      title: 'Group Planning',
      description: 'Collaborate with friends and team members on travel plans'
    }
  ]

  return (
    <section id="features" className="features">
      <h2>Why Choose Schedule Skies?</h2>
      <div className="feature-grid">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
