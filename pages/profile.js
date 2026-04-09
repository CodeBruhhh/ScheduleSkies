import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/profile.module.css';
import planStyles from '../styles/event.module.css';
import Sidebar from '../components/Sidebar';
import { FaCloud, FaDollarSign, FaCog, FaUserCircle } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';

const fallbackUser = {
  username: 'VIN, SKIES',
  email: 'vin.skies@example.com',
  travel_preferences: {
    environment: 'Both',
    pace: 'Relaxed',
    budget: 2 // 1: $, 2: $$, 3: $$$, 4: $$$$
  },
  saved_locations: [
    { id: '1', name: 'Fort San Pedro', type: 'Historical' },
    { id: '2', name: 'Cebu Ocean Park', type: 'Attraction' }
  ],
  saved_itineraries: [
    { id: '1', name: 'Cebu South Trip', date: 'March 4-7, 2026' },
    { id: '2', name: 'City Tour', date: 'April 10, 2026' }
  ],
  analytics: {
    trips_taken: 5,
    places_visited: 24,
    most_visited: 'Cebu City'
  }
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Preferences');
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [budget, setBudget] = useState(2); // Default to $$
  const [environment, setEnvironment] = useState('Both');
  const [pace, setPace] = useState('Relaxed');

  const budgetLevels = ['$', '$$', '$$$', '$$$$'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error('Not logged in');
        }

        const { data, error } = await supabase
          .from('User') 
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error || !data) {
          throw new Error('Could not fetch user data');
        }

        setUserData(data);
        if (data.travel_preferences) {
          setBudget(data.travel_preferences.budget || 2);
          setEnvironment(data.travel_preferences.environment || 'Both');
          setPace(data.travel_preferences.pace || 'Relaxed');
        }
      } catch (err) {
        console.log('Fetching user data failed, using fallback:', err.message);
        setUserData(fallbackUser);
        setBudget(fallbackUser.travel_preferences.budget);
        setEnvironment(fallbackUser.travel_preferences.environment);
        setPace(fallbackUser.travel_preferences.pace);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const OptionSelect = ({ label, options, selected, onSelect }) => (
    <div className={styles.option_group} style={{ marginBottom: '15px' }}>
      <span className={styles.option_label} style={{ display: 'block', marginBottom: '8px' }}>{label}</span>
      <div className={styles.options_container} style={{ display: 'flex', gap: '10px' }}>
        {options.map(opt => (
          <button 
            key={opt}
            className={`${styles.option_btn} ${selected === opt ? styles.option_active : ''}`}
            onClick={() => onSelect(opt)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '20px', 
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.3s ease'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading profile...</div>;
  }

  return (
    <div className={planStyles.appContainer}>
      <Head>
        <title>Account Profile</title>
      </Head>
      <Sidebar />
      
      <main className={planStyles.mainContent}>
        {/* Sky Decorations */}
        <div className={planStyles.sun}></div>
        <div className={`${planStyles.cloud} ${planStyles.cloud1}`}></div>
        <div className={`${planStyles.cloud} ${planStyles.cloud2}`}></div>

        <header className={styles.profile_header} style={{ marginBottom: '30px', borderRadius: '20px', overflow: 'hidden' }}>
          <div className={styles.profile_picture}></div>
          <div className={styles.profile_info} style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '20px 30px', borderRadius: '15px' }}>
            <h1 style={{ color: '#fff', margin: 0 }}>{userData?.username || 'GUEST'}</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.9, color: '#ddd' }}>{userData?.email}</p>
          </div>
        </header>

        {/* Filter Bar (Tabs) */}
        <div className={planStyles.filterBar}>
          <button 
            className={`${planStyles.filterBtn} ${activeTab === 'Preferences' ? planStyles.activeFilter : ''}`}
            onClick={() => setActiveTab('Preferences')}
          >
            Preferences
          </button>
          <button 
            className={`${planStyles.filterBtn} ${activeTab === 'Itineraries' ? planStyles.activeFilter : ''}`}
            onClick={() => setActiveTab('Itineraries')}
          >
            Itineraries & Locations
          </button>
          <button 
            className={`${planStyles.filterBtn} ${activeTab === 'Analytics' ? planStyles.activeFilter : ''}`}
            onClick={() => setActiveTab('Analytics')}
          >
            Analytics
          </button>
        </div>

        <div className={styles.profile_glass_body}>
          {activeTab === 'Preferences' && (
            <>
              <section className={styles.row_glass}>
                <div className={styles.col_glass}>
                  <div className={styles.glass_card}>
                    <h3><FaCloud /> Travel Style</h3>
                    <OptionSelect 
                      label="Environment"
                      options={['Indoor', 'Outdoor', 'Both']}
                      selected={environment}
                      onSelect={setEnvironment}
                    />
                    <OptionSelect 
                      label="Pace"
                      options={['Relaxed', 'Moderate', 'Fast-paced']}
                      selected={pace}
                      onSelect={setPace}
                    />
                  </div>
                </div>
                <div className={styles.col_glass}>
                  <div className={styles.glass_card}>
                    <h3><FaDollarSign /> Budget</h3>
                    <div className={styles.budget_container}>
                      <div className={styles.budget_display}>
                        <span className={styles.budget_label}>Category Limit</span>
                        <span className={styles.budget_value}>{budgetLevels[budget - 1]}</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="4" 
                        step="1" 
                        value={budget} 
                        onChange={(e) => setBudget(parseInt(e.target.value))}
                        className={styles.range_slider} 
                      />
                      <div className={styles.range_labels}>
                        <span>$</span>
                        <span>$$$$</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <div className={styles.settings_button_container} style={{ marginTop: '30px', textAlign: 'center' }}>
                <button className={styles.settings_button} style={{ 
                  background: 'rgba(255, 255, 255, 0.7)', 
                  color: '#333', 
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                  <FaCog /> Settings
                </button>
              </div>
            </>
          )}
          
          {activeTab === 'Itineraries' && (
            <section className={styles.row_glass}>
              <div className={styles.col_glass}>
                <div className={styles.glass_card}>
                  <h3>Saved Itineraries</h3>
                  <div className={styles.list_container}>
                    {userData?.saved_itineraries?.map(itinerary => (
                      <div key={itinerary.id} className={styles.list_item} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{itinerary.name}</h4>
                        <span className={styles.meta_text} style={{ fontSize: '14px', color: '#555' }}>{itinerary.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.col_glass}>
                <div className={styles.glass_card}>
                  <h3>Favorite Locations</h3>
                  <div className={styles.list_container}>
                    {userData?.saved_locations?.map(location => (
                      <div key={location.id} className={styles.list_item} style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '10px', marginBottom: '10px' }}>
                        <h4 style={{ margin: '0 0 5px 0' }}>{location.name}</h4>
                        <span className={styles.meta_text} style={{ fontSize: '14px', color: '#555' }}>{location.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'Analytics' && (
            <section className={styles.row_glass}>
              <div className={styles.col_glass}>
                <div className={styles.glass_card}>
                  <h3>Travel Analytics</h3>
                  <div className={styles.analytics_grid} style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
                    <div className={styles.stat_box} style={{ textAlign: 'center' }}>
                      <div className={styles.stat_value} style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6D7E99' }}>{userData?.analytics?.trips_taken || 0}</div>
                      <div className={styles.stat_label} style={{ fontSize: '0.9rem', color: '#555' }}>Trips Taken</div>
                    </div>
                    <div className={styles.stat_box} style={{ textAlign: 'center' }}>
                      <div className={styles.stat_value} style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6D7E99' }}>{userData?.analytics?.places_visited || 0}</div>
                      <div className={styles.stat_label} style={{ fontSize: '0.9rem', color: '#555' }}>Places Visited</div>
                    </div>
                    <div className={styles.stat_box} style={{ textAlign: 'center' }}>
                      <div className={styles.stat_value_text} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6D7E99', marginTop: '5px' }}>{userData?.analytics?.most_visited || 'N/A'}</div>
                      <div className={styles.stat_label} style={{ fontSize: '0.9rem', color: '#555' }}>Most Visited City</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
