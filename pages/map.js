import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Sidebar from '@/components/Sidebar'

 
const MapScreen = dynamic(() => import('@/components/Map_Screen/Map.jsx'), { ssr: false })
 
export default function MapPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [params, setParams] = useState({
    venueCoords: null,
    searchLabel: '',
    pickMode: false,
    pickContext: 'event',
    pickInitialCoords: null,
    pickHintLabel: '',
    itineraryWaypoints: null,
    isTraffic: false,
    trafficLabel: '',
  })
 
  useEffect(() => {
    if (!router.isReady) return
 
    const {
      lat, lng, label,
      originLat, originLng, originLabel,
      pick, from: fromParam, returnTo,
      waypoints,
      traffic, trafficTitle
    } = router.query
 
    const parsedLat = lat ? parseFloat(lat) : null
    const parsedLng = lng ? parseFloat(lng) : null
    const decodedLabel = label ? decodeURIComponent(label) : ''
    const parsedOriginLat = originLat ? parseFloat(originLat) : null
    const parsedOriginLng = originLng ? parseFloat(originLng) : null
    const decodedOriginLabel = originLabel ? decodeURIComponent(originLabel) : ''
 
    // Itinerary waypoints (JSON array)
    let parsedWaypoints = null
    if (waypoints) {
      try { parsedWaypoints = JSON.parse(decodeURIComponent(waypoints)) } catch (_) {}
    }
 
    setParams({
      venueCoords: parsedLat && parsedLng
        ? { lat: parsedLat, lng: parsedLng, label: decodedLabel }
        : null,
        originCoords: parsedOriginLat && parsedOriginLng
        ? { lat: parsedOriginLat, lng: parsedOriginLng, label: decodedOriginLabel }
        : null,
      searchLabel: decodedLabel,
      pickMode: pick === '1',
      pickContext: fromParam || 'event',
      pickInitialCoords: parsedLat && parsedLng ? { lat: parsedLat, lng: parsedLng } : null,
      pickHintLabel: decodedLabel,
      returnPath: returnTo || '/plan',
      itineraryWaypoints: parsedWaypoints,
      isTraffic: traffic === '1',
      trafficLabel: decodedLabel,trafficLabel: trafficTitle
      ? decodeURIComponent(trafficTitle)
      : '',
    })
    setReady(true)
  }, [router.isReady, router.query])
 
  if (!ready) return null
 
  return (
  <main className="dashboard" style={{ padding: 0, minHeight: '100vh' }}>
    
    <Sidebar />

    <Head>
      <title>Map | Schedule Skies</title>
    </Head>

    {/* Traffic incident banner */}
    {params.isTraffic && params.trafficLabel && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: isMobile ? 0 : 80,
        right: 0,
        zIndex: 99998,
        background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
        color: 'white',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <span style={{ fontSize: '18px' }}>🚦</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 800,
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Traffic Incident
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '1px' }}>
            {params.trafficLabel}
          </div>
        </div>

        <button
          onClick={() => router.back()}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 14px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>
    )}

    <MapScreen
      venueCoords={params.venueCoords}
      originCoords={params.originCoords}
      searchLabel={params.searchLabel}
      pickMode={params.pickMode}
      pickContext={params.pickContext}
      pickInitialCoords={params.pickInitialCoords}
      pickHintLabel={params.pickHintLabel}
      returnPath={params.returnPath}
      itineraryWaypoints={params.itineraryWaypoints}
      topOffset={params.isTraffic ? 48 : 0}
    />
  </main>
);
}