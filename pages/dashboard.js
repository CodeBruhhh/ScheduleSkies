import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Sidebar from '@/components/Sidebar'
import WeatherOverview from '@/components/WeatherOverview'
import ForecastCards from '@/components/ForecastCards'
import TrafficInfo from '@/components/TrafficInfo'
import Notifications from '@/components/Notifications'
import UpcomingPlans from '@/components/UpcomingPlans'
import SuggestedPlaces from '@/components/SuggestedPlaces'
import WeatherModal from '@/components/WeatherModal'
import ForecastModal from '@/components/ForecastModal'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const [username, setUsername] = useState('User')
  const [userId, setUserId] = useState(null)

  // ── Shared weather/forecast raw data ──────────────────────────
  const [rawWeatherData, setRawWeatherData] = useState(null)
  const [rawForecastData, setRawForecastData] = useState(null)

  // ── Modal state ───────────────────────────────────────────────
  const [weatherModalOpen, setWeatherModalOpen] = useState(false)
  const [forecastModalOpen, setForecastModalOpen] = useState(false)
  const [clickedForecastItem, setClickedForecastItem] = useState(null)

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (!user) { setUsername('User'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

      const displayName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0] ||
        'User'

      setUsername(displayName)
      setUserId(user.id)
    }
    fetchLoggedInUser()
  }, [])

  return (
    <>
      <Head>
        <title>Dashboard | Schedule Skies</title>
        <meta name="description" content="Plan your trips based on real-time weather and traffic predictions" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="dashboard">
        <Sidebar />
        <div className="sun" />
        <div className="cloud cloud1" />
        <div className="cloud cloud2" />

        <div
          className="home-header"
          style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(15px)', padding: '10px 10px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <WeatherOverview
            username={username}
            onRawData={setRawWeatherData}
            onCardClick={() => setWeatherModalOpen(true)}
          />
        </div>

        <div className="dashboard-content" style={{ paddingTop: '2rem' }}>
          <section className="row">
            <div className="col">
              <ForecastCards
                onRawData={setRawForecastData}
                onCardClick={(rawItem) => {
                  setClickedForecastItem(rawItem)
                  setForecastModalOpen(true)
                }}
              />
            </div>
            <div className="col"><TrafficInfo /></div>
            <div className="col"><Notifications userId={userId} /></div>
          </section>

          <section className="row">
            <div className="col wide"><UpcomingPlans /></div>
            <div className="col wide"><SuggestedPlaces /></div>
          </section>
        </div>
      </main>

      <WeatherModal
        open={weatherModalOpen}
        onClose={() => setWeatherModalOpen(false)}
        rawApiData={rawWeatherData}
      />
      <ForecastModal
        open={forecastModalOpen}
        onClose={() => setForecastModalOpen(false)}
        forecastItem={clickedForecastItem}
        allForecastRaw={rawForecastData}
      />
    </>
  )
}