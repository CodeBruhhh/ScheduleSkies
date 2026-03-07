import React, { useState } from 'react'
import Head from 'next/head'
import Navbar from '@/components/Navbar'

export default function PlanTrip() {
  const [formData, setFormData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Trip plan submitted:', formData)
    // TODO: Submit to API route
  }

  return (
    <>
      <Head>
        <title>Plan Your Trip - Schedule Skies</title>
        <meta name="description" content="Create and plan your trip with Schedule Skies" />
      </Head>
      <main>
        <Navbar />
        <section className="plan-section">
          <div className="plan-container">
            <h1>Plan Your Trip</h1>
            <form onSubmit={handleSubmit} className="plan-form">
              <div className="form-group">
                <label htmlFor="destination">Destination</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Enter destination city"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="departureDate">Departure Date</label>
                <input
                  type="date"
                  id="departureDate"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="returnDate">Return Date</label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="passengers">Number of Passengers</label>
                <input
                  type="number"
                  id="passengers"
                  name="passengers"
                  min="1"
                  value={formData.passengers}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn">Get Recommendations</button>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
