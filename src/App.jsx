import React from 'react';
import { Route, Map as MapIcon, BarChart3, Clock, Navigation, Moon, Sun, Layers, Search, MapPin, Settings, User, LogOut, Box, Car, Bus, Bike, Footprints, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, ZoomControl, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import polyline from 'polyline';
import './App.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ routeResult }) => {
  const map = useMap();
  React.useEffect(() => {
    if (routeResult) {
      const bounds = L.latLngBounds([
        [routeResult.sourceLoc.lat, routeResult.sourceLoc.lng],
        [routeResult.destLoc.lat, routeResult.destLoc.lng]
      ]);
      // Extend bounds to view the full path
      if (routeResult.roadPath && routeResult.roadPath.length > 0) {
        routeResult.roadPath.forEach(point => bounds.extend(point));
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeResult, map]);
  return null;
};

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentView, setCurrentView] = React.useState('home');
  const [locationsData, setLocationsData] = React.useState([]);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authName, setAuthName] = React.useState('');
  const [authError, setAuthError] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const users = JSON.parse(localStorage.getItem('optiroute_users') || '[]');
    const user = users.find(u => u.email === authEmail && u.password === authPassword);
    
    if (user) {
      localStorage.setItem('optiroute_session', JSON.stringify(user));
      setIsAuthenticated(true);
      setCurrentUser(user);
      setCurrentView('map');
      setAuthPassword('');
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authName || !authEmail || !authPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('optiroute_users') || '[]');
    if (users.find(u => u.email === authEmail)) {
      setAuthError('An account with this email already exists.');
      return;
    }

    const newUser = { name: authName, email: authEmail, password: authPassword };
    users.push(newUser);
    localStorage.setItem('optiroute_users', JSON.stringify(users));
    
    localStorage.setItem('optiroute_session', JSON.stringify(newUser));
    setIsAuthenticated(true);
    setCurrentUser(newUser);
    setCurrentView('map');
  };

  const handleLogout = () => {
    localStorage.removeItem('optiroute_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handleGuestLogin = () => {
    const guestUser = { name: 'Guest User', email: 'guest@optiroute.local' };
    setIsAuthenticated(true);
    setCurrentUser(guestUser);
    setCurrentView('map');
  };
  React.useEffect(() => {
    const session = localStorage.getItem('optiroute_session');
    if (session) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(session));
    }
    
    // Initial Preloader Timer (2.5 seconds)
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(loaderTimer);
  }, []);
  const [is3DMode, setIs3DMode] = React.useState(false);
  const [transportMode, setTransportMode] = React.useState('car');
  const [source, setSource] = React.useState('');
  const [destination, setDestination] = React.useState('');
  
  const [sourceSuggestions, setSourceSuggestions] = React.useState([]);
  const [destSuggestions, setDestSuggestions] = React.useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = React.useState(false);
  const [showDestDropdown, setShowDestDropdown] = React.useState(false);
  
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [routeResult, setRouteResult] = React.useState(null);
  const [theme, setTheme] = React.useState('light');
  const [mapView, setMapView] = React.useState('streets');

  // Performance Optimization: Debounce Search Inputs
  const [debouncedSource, setDebouncedSource] = React.useState('');
  const [debouncedDest, setDebouncedDest] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSource(source), 300);
    return () => clearTimeout(timer);
  }, [source]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedDest(destination), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  React.useEffect(() => {
    if (debouncedSource.length > 0) {
      const filtered = locationsData
        .filter(loc => loc.name.toLowerCase().includes(debouncedSource.toLowerCase()))
        .sort((a,b) => a.name.length - b.name.length) // Prioritize shorter matches
        .slice(0, 5); // Limit suggestions for performance
      setSourceSuggestions(filtered);
      setShowSourceDropdown(true);
    } else {
      setShowSourceDropdown(false);
    }
  }, [debouncedSource, locationsData]);

  React.useEffect(() => {
    if (debouncedDest.length > 0) {
      const filtered = locationsData
        .filter(loc => loc.name.toLowerCase().includes(debouncedDest.toLowerCase()))
        .sort((a,b) => a.name.length - b.name.length)
        .slice(0, 5);
      setDestSuggestions(filtered);
      setShowDestDropdown(true);
    } else {
      setShowDestDropdown(false);
    }
  }, [debouncedDest, locationsData]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    // Relative fetch based on Vite BASE_URL for subpath support (GitHub Pages)
    const base = import.meta.env.BASE_URL;
    const csvPath = (base.endsWith('/') ? base : base + '/') + 'locations.csv';
    
    fetch(csvPath)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.text();
      })
      .then(text => {
        // Validation: If it looks like HTML, don't parse it
        if (text.trim().startsWith('<')) {
           throw new Error('Received HTML instead of CSV');
        }

        const rows = text.split('\n').filter(row => row.trim() !== '');
        const data = rows.slice(1).map(row => {
          const parts = row.split(',');
          if (parts.length < 3) return null;
          const [name, lat, lng] = parts;
          return { name: name.trim(), lat: parseFloat(lat), lng: parseFloat(lng) };
        }).filter(item => item !== null);
        
        setLocationsData(data);
      })
      .catch(err => {
        console.error("Could not load locations.csv", err);
        // Fallback to empty to prevent UI crashes
        setLocationsData([]);
      });
  }, []);

  const handleSourceChange = (e) => {
    setSource(e.target.value);
  };

  const handleDestChange = (e) => {
    setDestination(e.target.value);
  };

  const selectSource = (name) => {
    setSource(name);
    setShowSourceDropdown(false);
  };
  
  const selectDest = (name) => {
    setDestination(name);
    setShowDestDropdown(false);
  };

  const findLocation = (query) => {
    if (!query) return null;
    const lowerQuery = query.toLowerCase().trim();
    let match = locationsData.find(loc => loc.name.toLowerCase() === lowerQuery);
    if (match) return match;
    return locationsData.find(loc => loc.name.toLowerCase().includes(lowerQuery));
  };

  const fetchLocationAPI = async (query) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`;
      const response = await fetch(url, { headers: { 'User-Agent': 'OptiRoute/1.0' } });
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          name: data[0].display_name.split(',')[0], 
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding API error:", error);
      return null;
    }
  };

  const clearRoute = () => {
    setRouteResult(null);
    setSource('');
    setDestination('');
  };

  const handleRouteSearch = async (e) => {
    if (e) e.preventDefault();
    if (!source || !destination) return;
    
    setIsCalculating(true);
    setRouteResult(null);
    setShowSourceDropdown(false);
    setShowDestDropdown(false);
    
    let sourceLoc = findLocation(source);
    let destLoc = findLocation(destination);

    if (!sourceLoc) {
      sourceLoc = await fetchLocationAPI(source);
    }
    if (!destLoc) {
      destLoc = await fetchLocationAPI(destination);
    }

    if (!sourceLoc || !destLoc) {
      setIsCalculating(false);
      alert("One or both locations could not be found within India. Please try specific local names.");
      return;
    }
    
    try {
      const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';
      let profile = 'driving';
      if (transportMode === 'cycle') profile = 'bike';
      if (transportMode === 'walk') profile = 'foot';
      
      const osrmUrl = `${OSRM_BASE_URL}/${profile}/${sourceLoc.lng},${sourceLoc.lat};${destLoc.lng},${destLoc.lat}?overview=full&geometries=polyline&steps=true`;
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error("Could not compute road route.");
      }

      const route = data.routes[0];
      const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
      let timeMin = Math.round(route.duration / 60);

      // Mathematically adjust time estimates since the public API only returns car driving times
      if (transportMode === 'bus') {
         timeMin = Math.round(timeMin * 1.5 + 5); 
      } else if (transportMode === 'cycle') {
         timeMin = Math.round(distanceKm * 4); // Avg 15 km/h for cycling = 4 min per km
      } else if (transportMode === 'walk') {
         timeMin = Math.round(distanceKm * 12); // Avg 5 km/h for walking = 12 min per km
      }

      // Convert timeMin to Hours and Minutes for readability
      let timeString = `${timeMin} min`;
      if (timeMin >= 60) {
         const hours = Math.floor(timeMin / 60);
         const mins = timeMin % 60;
         timeString = `${hours} hr ${mins} min`;
      }

      // Dynamic Traffic & Congestion Simulator based on route geometric average speeds
      let trafficLevel = 'Minimal';
      let trafficColor = 'var(--traffic-green)';
      
      if (transportMode === 'car' || transportMode === 'bus') {
          const speedKmH = distanceKm / (timeMin / 60);
          if (speedKmH < 25) {
              trafficLevel = 'Heavy Congestion Avoided';
              trafficColor = 'var(--traffic-red)';
          } else if (speedKmH < 45) {
              trafficLevel = 'Moderate';
              trafficColor = 'var(--traffic-yellow)';
          } else {
              trafficLevel = 'Traffic-Free';
          }
      } else if (transportMode === 'cycle') {
          trafficLevel = 'Bike Lanes Clear';
      } else {
          trafficLevel = 'Pedestrian Paths Clear';
      }

      let fuelMetric = '';
      if (transportMode === 'car') {
         fuelMetric = `⛽ Est. Fuel Used: ${(distanceKm / 15).toFixed(2)} L`;
      } else if (transportMode === 'bus') {
         fuelMetric = `🚌 Standard Fare: ₹${(distanceKm * 2).toFixed(0)} | Shared Carbon!`;
      } else if (transportMode === 'cycle') {
         fuelMetric = `🚲 Calories Burned: ~${(distanceKm * 25).toFixed(0)} kcal`;
      } else {
         fuelMetric = `👟 Calories Burned: ~${(distanceKm * 60).toFixed(0)} kcal`;
      }

      setIsCalculating(false);
      setRouteResult({
        sourceLoc,
        destLoc,
        roadPath: polyline.decode(route.geometry),
        distance: `${distanceKm} km`,
        time: timeString,
        traffic: trafficLevel,
        trafficColor: trafficColor,
        fuelSaved: fuelMetric,
        steps: route.legs[0].steps.map((step, index) => {
             const maneuver = step.maneuver;
             const instruction = (maneuver.type.replace('-', ' ') + ' ' + (maneuver.modifier ? maneuver.modifier.replace('-', ' ') : '') + (step.name ? ` onto ${step.name}` : '')).toLowerCase();
             return {
                 id: index,
                 instruction: instruction.charAt(0).toUpperCase() + instruction.slice(1),
                 distance: (step.distance / 1000).toFixed(1) + ' km',
                 lat: maneuver.location[1],
                 lng: maneuver.location[0]
             };
         })
      });
    } catch (error) {
      console.error("OSRM Routing error:", error);
      setIsCalculating(false);
      alert("Error calculating road route. Falling back to straight-line estimation.");
      const distanceFlat = Math.sqrt(Math.pow(sourceLoc.lat - destLoc.lat, 2) + Math.pow(sourceLoc.lng - destLoc.lng, 2));
      const distanceKm = (distanceFlat * 111.3).toFixed(1);
      
      setRouteResult({
        sourceLoc,
        destLoc,
        roadPath: [[sourceLoc.lat, sourceLoc.lng], [destLoc.lat, destLoc.lng]],
        distance: `${distanceKm} km`,
        time: (distanceKm * 2).toFixed(0) + " min",
        traffic: 'N/A',
        trafficColor: 'var(--text-muted)'
      });
    }
  };

  // Auto-update route calculations when transport mode is changed
  React.useEffect(() => {
    if (routeResult && source && destination) {
       handleRouteSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportMode]);

  if (isLoading) {
    return (
      <div className="preloader-overlay">
        <div className="preloader-3d-box">
          <div className="preloader-logo-wrap pulse-glow">
            <Route size={80} color="var(--primary-color)" />
          </div>
          <div className="preloader-text-wrap">
            <h1 className="preloader-title">OptiRoute</h1>
            <div className="loading-bar">
               <div className="loading-progress"></div>
            </div>
            <p className="preloader-status">Initializing Logistics Engine...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'login' || currentView === 'signup') {
    return (
      <div className="home-container">
        <header className="home-header">
          <div className="home-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')}>
            <Route className="logo-icon" size={32} />
            <span className="logo-text">OptiRoute</span>
          </div>
          <button 
            className="theme-toggle glass-btn" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        
        <div className="auth-wrapper animate-fade-in">
          <div className="auth-card">
            <h2 className="auth-title">{currentView === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
            <p className="auth-subtitle">
              {currentView === 'login' ? 'Sign in to access your routes.' : 'Join OptiRoute to optimize your travel.'}
            </p>
            
            {authError && <div className="auth-error">{authError}</div>}
            
            <form onSubmit={currentView === 'login' ? handleLogin : handleSignup} className="auth-form">
              {currentView === 'signup' && (
                <div className="auth-input-group">
                  <label htmlFor="auth-name">Full Name</label>
                  <input id="auth-name" type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required placeholder="John Doe" autoComplete="name" />
                </div>
              )}
              
              <div className="auth-input-group">
                <label htmlFor="auth-email">Email Address</label>
                <input id="auth-email" type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required placeholder="john@example.com" autoComplete="email" />
              </div>
              
              <div className="auth-input-group">
                <label htmlFor="auth-password">Password</label>
                <input id="auth-password" type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required placeholder="••••••••" autoComplete="current-password" />
              </div>
              
              <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem' }}>
                {currentView === 'login' ? 'Sign In' : 'Sign Up'}
              </button>

              <button type="button" onClick={handleGuestLogin} className="btn btn-outline w-full" style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: '0.75rem' }}>
                Continue as Guest
              </button>
            </form>
            
            <div className="auth-switch">
              {currentView === 'login' ? (
                <p>Don't have an account? <span onClick={() => { setCurrentView('signup'); setAuthError(''); }} className="auth-link">Sign up</span></p>
              ) : (
                <p>Already have an account? <span onClick={() => { setCurrentView('login'); setAuthError(''); }} className="auth-link">Log in</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'profile') {
    if (!isAuthenticated) {
      setCurrentView('login');
      return null;
    }
    
    return (
      <div className="home-container">
        <header className="home-header">
          <div className="home-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')}>
            <Route className="logo-icon" size={32} />
            <span className="logo-text">OptiRoute</span>
          </div>
          <button 
            className="theme-toggle glass-btn" 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        
        <div className="auth-wrapper animate-fade-in">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div style={{ margin: '0 auto 1.5rem', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
               <User size={36} color="var(--primary-color)" />
            </div>
            <h2 className="auth-title">User Profile</h2>
            <p className="auth-subtitle">Manage your OptiRoute account.</p>
            
            <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', marginBottom: '2rem', textAlign: 'left' }}>
               <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</p>
               <p style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 600 }}>{currentUser?.name}</p>
               <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</p>
               <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{currentUser?.email}</p>
            </div>
            
            <button className="btn btn-outline w-full" onClick={() => setCurrentView('map')} style={{ marginBottom: '1rem', justifyContent: 'center' }}>
               <MapIcon size={18} /> Return to Map
            </button>
            <button className="btn w-full" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--traffic-red)', justifyContent: 'center' }}>
               <LogOut size={18} /> Logout of Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'home') {
    return (
      <div className="home-container">
        {/* Header */}
        <header className="home-header">
          <div className="home-logo">
            <Route className="logo-icon blur-glow" size={32} />
            <span className="logo-text">OptiRoute</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <span style={{ fontWeight: 500 }} className="hide-mobile">Welcome, {currentUser?.name}</span>
                <button className="glass-btn" onClick={() => setCurrentView('profile')} title="Profile Settings"><Settings size={20} /></button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentView('login')} style={{ padding: '0.4rem 1.5rem', borderRadius: '2rem' }}>Login</button>
            )}
            <button 
              className="theme-toggle glass-btn" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content animate-fade-in">
            <h1 className="hero-title">Navigate Smarter. <span className="highlight-text">Avoid Traffic.</span></h1>
            <p className="hero-subtitle">
              Optimize modern transit with intelligent multi-modal logistics. Eliminate guesswork using real-time data, precise route mapping, and personalized eco-efficient insights.
            </p>
            <button className="btn btn-primary btn-cta" onClick={() => {
              if (isAuthenticated) setCurrentView('map');
              else setCurrentView('login');
            }}>
              Start Your Smart Journey <Navigation size={20} />
            </button>
          </div>
        </section>

        {/* Features Graph */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon bg-green"><Footprints size={28} color="white" /></div>
              <h3>Multi-Modal Intelligence</h3>
              <p>Whether computing parameters for Driving, Public Transit, Cycling, or Walking, OptiRoute seamlessly recalculates physical map geometry.</p>
            </div>
            
            <div className="feature-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon bg-blue"><MapIcon size={28} color="white" /></div>
              <h3>Live Traffic Scaling</h3>
              <p>Forget straight-line guesses. Our proprietary algorithms interpret structural road speeds to highlight explicit Traffic-Free pathways instantly.</p>
            </div>
            
            <div className="feature-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon bg-purple"><Box size={28} color="white" /></div>
              <h3>Isometric 3D Mapping</h3>
              <p>Pitch the flat mapping systems directly into an immersive, stylized 55-degree 3D plane for superior perspective analysis.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <Route className="logo-icon" size={24} color="var(--primary-color)" />
              <span>OptiRoute</span>
              <p>An intelligent transport route scheduling and optimization system utilizing real-world road data to help you save fuel.</p>
            </div>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact Support</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 OptiRoute | DevPythush — Mapping smarter journeys, one route at a time.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container map-focus-mode">
      
      {/* Floating Header Actions (Top Right) */}
      <div className="map-controls-top-right">
        {isAuthenticated && (
          <button 
            className="map-action-btn glass-panel"
            onClick={() => setCurrentView('profile')}
            title="Profile Settings"
          >
            <Settings size={20} />
          </button>
        )}
        <button 
          className="map-action-btn glass-panel"
          onClick={() => setMapView(mapView === 'streets' ? 'satellite' : 'streets')}
          title="Toggle Map View"
        >
          <Layers size={20} />
        </button>
        <button 
          className="map-action-btn glass-panel"
          onClick={() => setIs3DMode(!is3DMode)}
          title="Toggle 3D View"
          style={is3DMode ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)' } : {}}
        >
          <Box size={20} />
        </button>
        <button 
          className="map-action-btn glass-panel" 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Sidebar Panel (Left Base) */}
      <div className="sidebar-panel">
        <div className="planner-header">
          <button 
            onClick={() => setCurrentView('home')} 
            className="back-btn"
            title="Return to Home"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')} title="Return to Home">
            <Route className="logo-icon" size={28} />
            <span>OptiRoute</span>
          </div>
          <p className="planner-subtitle">Smart Route Optimization</p>
          {isAuthenticated && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Driver: <strong>{currentUser?.name}</strong></span>
              <span onClick={() => setCurrentView('profile')} style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500, padding: '4px', background: 'var(--bg-main)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={14}/> Settings</span>
            </div>
          )}
        </div>

        <form className="planner-form" onSubmit={handleRouteSearch}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <button type="button" onClick={() => setTransportMode('car')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: transportMode === 'car' ? 'var(--primary-color)' : 'transparent', color: transportMode === 'car' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }} title="Driving (Car)">
              <Car size={20} style={{ margin: '0 auto' }} />
            </button>
            <button type="button" onClick={() => setTransportMode('bus')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: transportMode === 'bus' ? 'var(--primary-color)' : 'transparent', color: transportMode === 'bus' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }} title="Public Transit (Bus)">
              <Bus size={20} style={{ margin: '0 auto' }} />
            </button>
            <button type="button" onClick={() => setTransportMode('cycle')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: transportMode === 'cycle' ? 'var(--primary-color)' : 'transparent', color: transportMode === 'cycle' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }} title="Cycling">
              <Bike size={20} style={{ margin: '0 auto' }} />
            </button>
            <button type="button" onClick={() => setTransportMode('walk')} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: transportMode === 'walk' ? 'var(--primary-color)' : 'transparent', color: transportMode === 'walk' ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }} title="Walking">
              <Footprints size={20} style={{ margin: '0 auto' }} />
            </button>
          </div>

          <div className="route-inputs-container">
            <div className="route-connecting-line"></div>
            
            {/* Source Input */}
            <div className="input-group relative">
              <div className="input-with-icon">
                <Navigation className="input-icon" size={18} color="var(--traffic-green)" />
                <input 
                  id="source-input"
                  type="text" 
                  placeholder="Choose starting point" 
                  value={source}
                  onChange={handleSourceChange}
                  onFocus={() => { if (source.length > 0) setShowSourceDropdown(true) }}
                  autoComplete="off"
                  required 
                />
              </div>
              
              {/* Source Autocomplete Dropdown */}
              {showSourceDropdown && sourceSuggestions.length > 0 && (
                <ul className="autocomplete-dropdown glass-dropdown">
                  {sourceSuggestions.map((loc, idx) => (
                    <li key={idx} onClick={() => selectSource(loc.name)} className="autocomplete-item">
                      <MapPin size={16} className="text-muted" />
                      <span>{loc.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Destination Input */}
            <div className="input-group relative">
              <div className="input-with-icon">
                <MapIcon className="input-icon" size={18} color="var(--traffic-red)" />
                <input 
                  id="destination-input"
                  type="text" 
                  placeholder="Choose destination" 
                  value={destination}
                  onChange={handleDestChange}
                  onFocus={() => { if (destination.length > 0) setShowDestDropdown(true) }}
                  autoComplete="off"
                  required 
                />
              </div>

               {/* Destination Autocomplete Dropdown */}
               {showDestDropdown && destSuggestions.length > 0 && (
                <ul className="autocomplete-dropdown glass-dropdown">
                  {destSuggestions.map((loc, idx) => (
                    <li key={idx} onClick={() => selectDest(loc.name)} className="autocomplete-item">
                      <MapPin size={16} className="text-muted" />
                      <span>{loc.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-search w-full" disabled={isCalculating}>
              {isCalculating ? <span className="spinner-small"></span> : <Search size={18} />}
              {isCalculating ? 'Computing...' : 'Find Route'}
            </button>
            {routeResult && (
              <button type="button" className="btn btn-outline btn-clear w-full mt-2" onClick={clearRoute}>
                Clear Route
              </button>
            )}
          </div>
        </form>

        {/* Results Section inside Planner */}
        {routeResult && (
          <div className="route-results-container animate-fade-in">
            <div className="route-overview">
              <div className="trip-time">{routeResult.time}</div>
              <div className="trip-distance">{routeResult.distance} • <span style={{color: routeResult.trafficColor}}>{routeResult.traffic} Traffic</span></div>
              {routeResult.fuelSaved && (
                 <div className="fuel-saved-badge mt-2" style={{ color: 'var(--traffic-green)', fontSize: '0.9rem', fontWeight: 600 }}>
                    {routeResult.fuelSaved}
                 </div>
              )}
            </div>
            
            <div className="route-breakdown">
                <strong>Best & Fastest Route:</strong> <br/>
                <span className="location-tag start">{routeResult.sourceLoc.name}</span> <br/>
                <span className="route-arrow">↓</span> <br/>
                <span className="location-tag end">{routeResult.destLoc.name}</span>
            </div>

            {routeResult.steps && routeResult.steps.length > 0 && (
                <div className="route-steps" style={{ marginTop: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Step-by-Step Directions</h4>
                  <ul className="steps-list" style={{ maxHeight: '160px', overflowY: 'auto', listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                    {routeResult.steps.map(step => (
                        <li key={step.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                           <span style={{flex: 1, paddingRight: '1rem', color: 'var(--text-main)'}}>{step.instruction}</span>
                           <span style={{color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>{step.distance}</span>
                        </li>
                    ))}
                  </ul>
                </div>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Persistent Map */}
      <div className={`fullscreen-map map-viewport ${is3DMode ? 'active-3d' : ''}`}>
        <MapContainer 
          center={[28.4744, 77.5030]} /* Default center to Pari Chowk */
          zoom={12} 
          style={{ height: "100vh", width: "100%", zIndex: 0 }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          
          {mapView === 'streets' ? (
            theme === 'light' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            )
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Tools'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {routeResult && (
            <>
              <Marker position={[routeResult.sourceLoc.lat, routeResult.sourceLoc.lng]} icon={startIcon}>
                <Popup><b>Start:</b> {routeResult.sourceLoc.name}</Popup>
              </Marker>
              <Marker position={[routeResult.destLoc.lat, routeResult.destLoc.lng]} icon={endIcon}>
                <Popup><b>Destination:</b> {routeResult.destLoc.name}</Popup>
              </Marker>
              <Polyline 
                positions={routeResult.roadPath} 
                color={mapView === 'satellite' ? '#3b82f6' : 'var(--primary-color)'} 
                weight={6} 
                opacity={0.8}
              />
              {routeResult.steps && routeResult.steps.map(step => (
                 <CircleMarker 
                    key={step.id} 
                    center={[step.lat, step.lng]} 
                    radius={5} 
                    pathOptions={{ color: 'white', fillColor: 'var(--primary-color)', fillOpacity: 1, weight: 2 }}
                 >
                    <Popup>{step.instruction}</Popup>
                 </CircleMarker>
              ))}
              <MapUpdater routeResult={routeResult} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
