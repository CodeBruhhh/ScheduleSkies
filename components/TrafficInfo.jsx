import React, { useState, useEffect } from 'react'
import styles from '../styles/traffic.module.css'
import { useRouter } from 'next/router'
import { getBboxFromUserLocation } from '@/lib/getLocation'

const locationCache = new Map();

const iconMap = {
  1: "🚗", 2: "🌫️", 3: "⚠️", 4: "🌧️", 5: "🧊",
  6: "🚦", 7: "🚧", 8: "⛔", 9: "🚧", 10: "💨",
  11: "🌊", 14: "🚙",
};

// Returns { from: {lat,lng}, to: {lat,lng} } using the
// first and last coordinate of the incident geometry.
function getIncidentEndpoints(inc) {
  const geo = inc?.geometry;
  if (!geo) return null;

  if (geo.type === 'Point') {
    const [lon, lat] = geo.coordinates;
    return { from: { lat, lng: lon }, to: { lat, lng: lon } };
  }

  let coords = [];
  if (geo.type === 'LineString')      coords = geo.coordinates;
  if (geo.type === 'MultiLineString') coords = geo.coordinates.flat();
  if (coords.length === 0) return null;

  const first = coords[0];
  const last  = coords[coords.length - 1];
  return {
    from: { lat: first[1], lng: first[0] },
    to:   { lat: last[1],  lng: last[0]  },
  };
}

export default function TrafficInfo() {
  const router = useRouter()
  const [incidentData, setIncidentData] = useState([]);
  const [rawIncidents, setRawIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const CACHE_TTL    = 1000 * 60 * 5;
  const CACHE_KEY    = 'traffic_cache';
  const RAW_CACHE_KEY = 'traffic_raw_cache';

  async function loadIncidents() {
    try {
      const cached    = JSON.parse(sessionStorage.getItem(CACHE_KEY));
      const rawCached = JSON.parse(sessionStorage.getItem(RAW_CACHE_KEY));
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setIncidentData(cached.data);
        if (rawCached?.data) setRawIncidents(rawCached.data);
        setLoading(false);
        return;
      }
    } catch (_) {}

    if (!process.env.NEXT_PUBLIC_TRAFFIC_API_KEY) { setLoading(false); return; }

    const bbox   = await getBboxFromUserLocation(5);
    const fields = encodeURIComponent("{incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description},startTime,endTime,from,to}}}");
    const url    = `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${process.env.NEXT_PUBLIC_TRAFFIC_API_KEY}&bbox=${bbox}&fields=${fields}&language=en-GB&timeValidityFilter=present`;

    try {
      const response = await fetch(url);
      if (!response.ok) { console.warn('Traffic API returned', response.status); setLoading(false); return; }
      const data = await response.json();

      const raw = data?.incidents || [];
      setRawIncidents(raw);
      sessionStorage.setItem(RAW_CACHE_KEY, JSON.stringify({ data: raw, timestamp: Date.now() }));

      const incidentArray = await transformIncidents(data);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: incidentArray, timestamp: Date.now() }));
      setIncidentData(incidentArray);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function transformIncidents(data) {
    const incidents = data?.incidents || [];
    return Promise.all(incidents.map(async (inc) => {
      const p     = inc.properties || {};
      const event = p.events?.[0]  || {};
      let location = p.from || p.to || null;
      if (!location) {
        const ep = getIncidentEndpoints(inc);
        if (ep) location = await getLocationName(ep.from.lat, ep.from.lng);
      }
      return {
        id: p.id, title: event.description || 'Traffic incident',
        location, iconCategory: p.iconCategory,
        delayLevel: p.magnitudeOfDelay ?? 0,
        from: p.from, to: p.to,
      };
    }));
  }

  async function getLocationName(lat, lon) {
    const key = `${lat},${lon}`;
    if (locationCache.has(key)) return locationCache.get(key);
    try {
      const res  = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${process.env.NEXT_PUBLIC_TRAFFIC_API_KEY}`);
      const data = await res.json();
      const name = data?.addresses?.[0]?.address?.freeformAddress || 'Unknown location';
      locationCache.set(key, name);
      return name;
    } catch { return 'Unknown location'; }
  }

  function handleIncidentClick(inc, idx) {
    const raw       = rawIncidents[idx];
    const endpoints = raw ? getIncidentEndpoints(raw) : null;

    const fromLabel = inc.from || 'Incident start';
    const toLabel   = inc.to   || 'Incident end';

    if (endpoints) {
      const params = new URLSearchParams({
        originLat:    endpoints.from.lat,
        originLng:    endpoints.from.lng,
        originLabel:  fromLabel,
        lat:          endpoints.to.lat,
        lng:          endpoints.to.lng,
        label:        toLabel,
        traffic:      '1',
        trafficTitle: inc.title || 'Traffic Incident',
        trafficFrom:  fromLabel,
        trafficTo:    toLabel,
      });
      router.push(`/map?${params.toString()}`);
    } else {
      router.push(`/map?label=${encodeURIComponent(fromLabel)}&traffic=1&trafficTitle=${encodeURIComponent(inc.title || 'Traffic Incident')}`);
    }
  }

  useEffect(() => { loadIncidents(); }, []);

  return (
    <div className={styles.container}>
      <p className={styles.title}>TRAFFIC INFO</p>
      <div className={styles.traffic_container}>
        {loading ? (
          <div className="spinner-container"><div className="loading-spinner" /></div>
        ) : incidentData.length > 0 ? (
          incidentData.map((inc, idx) => (
            <div
              key={inc.id ?? idx}
              className={`${inc.delayLevel > 2 ? styles.heavy : styles.moderate} ${styles.clickable}`}
              onClick={() => handleIncidentClick(inc, idx)}
              title="Click to view on map"
            >
              <div className={styles.icon}>
                <span>{iconMap[inc.iconCategory] || '⚠️'}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p className={styles.text}>{inc.title || inc.from}</p>
                <p className={styles.location}>
                  {inc.from && inc.to ? `${inc.from} → ${inc.to}` : inc.location || ''}
                </p>
              </div>
              <div className={styles.mapHint}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l6-3l6 3l6-3v13l-6 3l-6-3l-6 3z"/>
                  <path d="M9 4v13M15 7v13"/>
                </svg>
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', textAlign: 'center', gap: '8px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600 }}>No traffic information found...</p>
          </div>
        )}
      </div>
    </div>
  )
}