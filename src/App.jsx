import React from 'react';
import { Route, Map as MapIcon, BarChart3, Clock, Navigation, Moon, Sun, Layers, Search, MapPin, Settings, User, LogOut, Box, Car, Bus, Bike, Footprints, ArrowLeft, Plus, X, Trash, CloudSun, TrendingUp, GripVertical, Plane, Train, Send, CheckCircle, ChevronDown, Key, Mail, MessageCircle, BookOpen } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, ZoomControl, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import L from 'leaflet';
import polyline from 'polyline';
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  onSnapshot 
} from './localDB';
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

const intermediateIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const planeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const metroIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const busIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const METRO_STATIONS_DATA = {
  'Pari Chowk Metro Station': { lat: 28.4682, lng: 77.5115, line: 'Aqua Line', color: '#00ced1', links: ['Alpha 1 Metro Station'] },
  'Alpha 1 Metro Station': { lat: 28.4735, lng: 77.5098, line: 'Aqua Line', color: '#00ced1', links: ['Pari Chowk Metro Station', 'Knowledge Park II Metro Station'] },
  'Knowledge Park II Metro Station': { lat: 28.4601, lng: 77.4920, line: 'Aqua Line', color: '#00ced1', links: ['Alpha 1 Metro Station', 'Noida Sector 142 Metro Station'] },
  'Noida Sector 142 Metro Station': { lat: 28.5140, lng: 77.4110, line: 'Aqua Line', color: '#00ced1', links: ['Knowledge Park II Metro Station', 'Noida Sector 137 Metro Station'] },
  'Noida Sector 137 Metro Station': { lat: 28.5190, lng: 77.4020, line: 'Aqua Line', color: '#00ced1', links: ['Noida Sector 142 Metro Station', 'Noida Sector 83 Metro Station'] },
  'Noida Sector 83 Metro Station': { lat: 28.5300, lng: 77.3910, line: 'Aqua Line', color: '#00ced1', links: ['Noida Sector 137 Metro Station', 'Noida Sector 50 Metro Station'] },
  'Noida Sector 50 Metro Station': { lat: 28.5600, lng: 77.3820, line: 'Aqua Line', color: '#00ced1', links: ['Noida Sector 83 Metro Station', 'Noida Sector 51 Metro Station'] },
  'Noida Sector 51 Metro Station': { lat: 28.5678, lng: 77.3855, line: 'Aqua Line', color: '#00ced1', links: ['Noida Sector 50 Metro Station', 'Noida Sector 52 Metro Station'] },
  
  'Noida Sector 52 Metro Station': { lat: 28.5700, lng: 77.3860, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 51 Metro Station', 'Golf Course Metro Station', 'Noida Sector 61 Metro Station'] },
  'Golf Course Metro Station': { lat: 28.5680, lng: 77.3460, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 52 Metro Station', 'Noida City Centre Metro Station'] },
  'Noida City Centre Metro Station': { lat: 28.5747, lng: 77.3560, line: 'Blue Line', color: '#0072bb', links: ['Golf Course Metro Station', 'Botanical Garden Metro Station'] },
  'Botanical Garden Metro Station': { lat: 28.5641, lng: 77.3342, line: 'Blue Line/Magenta Line Interchange', color: '#7030a0', links: ['Noida City Centre Metro Station', 'Noida Sector 15 Metro Station', 'Okhla Bird Sanctuary Metro Station'] },
  'Noida Sector 15 Metro Station': { lat: 28.5780, lng: 77.3110, line: 'Blue Line', color: '#0072bb', links: ['Botanical Garden Metro Station', 'Mayur Vihar Ext Metro Station'] },
  'Mayur Vihar Ext Metro Station': { lat: 28.5997, lng: 77.2936, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 15 Metro Station', 'Akshardham Metro Station'] },
  'Akshardham Metro Station': { lat: 28.6180, lng: 77.2789, line: 'Blue Line', color: '#0072bb', links: ['Mayur Vihar Ext Metro Station', 'Indraprastha Metro Station'] },
  'Indraprastha Metro Station': { lat: 28.6210, lng: 77.2510, line: 'Blue Line', color: '#0072bb', links: ['Akshardham Metro Station', 'Mandi House Metro Station'] },
  'Mandi House Metro Station': { lat: 28.6260, lng: 77.2340, line: 'Blue Line', color: '#0072bb', links: ['Indraprastha Metro Station', 'Rajiv Chowk Metro Station'] },
  'Rajiv Chowk Metro Station': { lat: 28.6304, lng: 77.2177, line: 'Blue Line', color: '#0072bb', links: ['Mandi House Metro Station'] },
  
  'Noida Sector 61 Metro Station': { lat: 28.5950, lng: 77.3750, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 52 Metro Station', 'Noida Sector 59 Metro Station'] },
  'Noida Sector 59 Metro Station': { lat: 28.6110, lng: 77.3680, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 61 Metro Station', 'Noida Sector 62 Metro Station'] },
  'Noida Sector 62 Metro Station': { lat: 28.6214, lng: 77.3622, line: 'Blue Line', color: '#0072bb', links: ['Noida Sector 59 Metro Station'] },
  
  'Okhla Bird Sanctuary Metro Station': { lat: 28.5480, lng: 77.3160, line: 'Magenta Line', color: '#7030a0', links: ['Botanical Garden Metro Station', 'Kalindi Kunj Metro Station'] },
  'Kalindi Kunj Metro Station': { lat: 28.5430, lng: 77.3020, line: 'Magenta Line', color: '#7030a0', links: ['Okhla Bird Sanctuary Metro Station', 'Jasola Vihar Shaheen Bagh Metro Station'] },
  'Jasola Vihar Shaheen Bagh Metro Station': { lat: 28.5390, lng: 77.2880, line: 'Magenta Line', color: '#7030a0', links: ['Kalindi Kunj Metro Station', 'Okhla Vihar Metro Station'] },
  'Okhla Vihar Metro Station': { lat: 28.5420, lng: 77.2730, line: 'Magenta Line', color: '#7030a0', links: ['Jasola Vihar Shaheen Bagh Metro Station', 'Jamia Millia Islamia Metro Station'] },
  'Jamia Millia Islamia Metro Station': { lat: 28.5610, lng: 77.2520, line: 'Magenta Line', color: '#7030a0', links: ['Okhla Vihar Metro Station'] }
};

const CUSTOM_LOCATIONS = [
  // Metro Stations
  { name: 'Pari Chowk Metro Station', lat: 28.4682, lng: 77.5115, type: 'metro' },
  { name: 'Alpha 1 Metro Station', lat: 28.4735, lng: 77.5098, type: 'metro' },
  { name: 'Knowledge Park II Metro Station', lat: 28.4601, lng: 77.4920, type: 'metro' },
  { name: 'Noida Sector 142 Metro Station', lat: 28.5140, lng: 77.4110, type: 'metro' },
  { name: 'Noida Sector 137 Metro Station', lat: 28.5190, lng: 77.4020, type: 'metro' },
  { name: 'Noida Sector 83 Metro Station', lat: 28.5300, lng: 77.3910, type: 'metro' },
  { name: 'Noida Sector 50 Metro Station', lat: 28.5600, lng: 77.3820, type: 'metro' },
  { name: 'Noida Sector 51 Metro Station', lat: 28.5678, lng: 77.3855, type: 'metro' },
  { name: 'Noida Sector 52 Metro Station', lat: 28.5700, lng: 77.3860, type: 'metro' },
  { name: 'Noida Sector 61 Metro Station', lat: 28.5950, lng: 77.3750, type: 'metro' },
  { name: 'Noida Sector 59 Metro Station', lat: 28.6110, lng: 77.3680, type: 'metro' },
  { name: 'Noida Sector 62 Metro Station', lat: 28.6214, lng: 77.3622, type: 'metro' },
  { name: 'Noida City Centre Metro Station', lat: 28.5747, lng: 77.3560, type: 'metro' },
  { name: 'Golf Course Metro Station', lat: 28.5680, lng: 77.3460, type: 'metro' },
  { name: 'Botanical Garden Metro Station', lat: 28.5641, lng: 77.3342, type: 'metro' },
  { name: 'Noida Sector 15 Metro Station', lat: 28.5780, lng: 77.3110, type: 'metro' },
  { name: 'Mayur Vihar Ext Metro Station', lat: 28.5997, lng: 77.2936, type: 'metro' },
  { name: 'Akshardham Metro Station', lat: 28.6180, lng: 77.2789, type: 'metro' },
  { name: 'Indraprastha Metro Station', lat: 28.6210, lng: 77.2510, type: 'metro' },
  { name: 'Mandi House Metro Station', lat: 28.6260, lng: 77.2340, type: 'metro' },
  { name: 'Rajiv Chowk Metro Station', lat: 28.6304, lng: 77.2177, type: 'metro' },
  { name: 'Okhla Bird Sanctuary Metro Station', lat: 28.5480, lng: 77.3160, type: 'metro' },
  { name: 'Kalindi Kunj Metro Station', lat: 28.5430, lng: 77.3020, type: 'metro' },
  { name: 'Jasola Vihar Shaheen Bagh Metro Station', lat: 28.5390, lng: 77.2880, type: 'metro' },
  { name: 'Okhla Vihar Metro Station', lat: 28.5420, lng: 77.2730, type: 'metro' },
  { name: 'Jamia Millia Islamia Metro Station', lat: 28.5610, lng: 77.2520, type: 'metro' },

  // Airports
  { name: 'Indira Gandhi International Airport (DEL)', lat: 28.5562, lng: 77.1000, type: 'airline' },
  { name: 'Chhatrapati Shivaji International Airport (BOM)', lat: 19.0896, lng: 72.8656, type: 'airline' },
  { name: 'Kempegowda International Airport (BLR)', lat: 13.1986, lng: 77.7066, type: 'airline' },
  { name: 'Netaji Subhash Chandra Bose Airport (CCU)', lat: 22.6547, lng: 88.4467, type: 'airline' },
  { name: 'Chennai International Airport (MAA)', lat: 12.9941, lng: 80.1709, type: 'airline' },
  { name: 'Rajiv Gandhi International Airport (HYD)', lat: 17.2403, lng: 78.4294, type: 'airline' },
  { name: 'Noida International Airport (Jewar)', lat: 28.1500, lng: 77.8000, type: 'airline' },

  // Bus Stands
  { name: 'Anand Vihar ISBT', lat: 28.6468, lng: 77.3160, type: 'bus' },
  { name: 'Kashmiri Gate ISBT', lat: 28.6675, lng: 77.2284, type: 'bus' },
  { name: 'Noida Depot (Sector 37)', lat: 28.5644, lng: 77.3361, type: 'bus' },
  { name: 'Greater Noida Depot', lat: 28.4800, lng: 77.4900, type: 'bus' },
  { name: 'Pari Chowk Bus Stand', lat: 28.4675, lng: 77.5090, type: 'bus' }
];

const MapUpdater = ({ routeResult, activeRouteIndex }) => {
  const map = useMap();
  React.useEffect(() => {
    if (routeResult && routeResult.resolvedLocs && routeResult.resolvedLocs.length > 0) {
      const first = routeResult.resolvedLocs[0];
      const bounds = L.latLngBounds([[first.lat, first.lng]]);
      routeResult.resolvedLocs.forEach(loc => bounds.extend([loc.lat, loc.lng]));
      
      const activeRoute = routeResult.routes && routeResult.routes[activeRouteIndex];
      if (activeRoute && activeRoute.roadPath && activeRoute.roadPath.length > 0) {
        activeRoute.roadPath.forEach(point => bounds.extend(point));
      }
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeResult, activeRouteIndex, map]);
  return null;
};

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [demoMessage, setDemoMessage] = React.useState('');
  const [currentView, setCurrentView] = React.useState('home');
  const [locationsData, setLocationsData] = React.useState([]);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [searchHistory, setSearchHistory] = React.useState([]);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = React.useState('');
  const [authPassword, setAuthPassword] = React.useState('');
  const [authName, setAuthName] = React.useState('');
  const [authError, setAuthError] = React.useState('');

  // Profile Dashboard, Custom Preferences, and Header States
  const [activeProfileTab, setActiveProfileTab] = React.useState('account');
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [profileName, setProfileName] = React.useState('');
  const [profileEmail, setProfileEmail] = React.useState('');
  const [profilePassword, setProfilePassword] = React.useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState('');
  const [copiedApiKey, setCopiedApiKey] = React.useState(false);
  const [developerApiKey] = React.useState('or_pub_live_5f2b8c9d0e1a');
  const [userPreferences, setUserPreferences] = React.useState({
    defaultMode: 'driving',
    mapStyle: 'streets',
    useMetric: true,
    notifications: true
  });

  // Support Page States
  const [openFaq, setOpenFaq] = React.useState(null);
  const [supportName, setSupportName] = React.useState('');
  const [supportEmail, setSupportEmail] = React.useState('');
  const [supportMsg, setSupportMsg] = React.useState('');
  const [supportSent, setSupportSent] = React.useState(false);

  // Share & Export States and Handlers
  const [isRouteShared, setIsRouteShared] = React.useState(false);

  const handleShareRoute = () => {
    const encodedWps = waypoints.map(encodeURIComponent).join(',');
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?category=${routeCategory}&waypoints=${encodedWps}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsRouteShared(true);
      setTimeout(() => setIsRouteShared(false), 2000);
    });
  };

  const handleExportItinerary = () => {
    if (!routeResult || !routeResult.routes) return;
    const activeRoute = routeResult.routes[activeRouteIndex];
    
    const exportData = {
      platform: "OptiRoute",
      transitMode: routeCategory,
      departureTime: departureTime,
      totalDistance: activeRoute.distance,
      estimatedDuration: activeRoute.time,
      trafficStatus: activeRoute.traffic,
      stops: routeResult.resolvedLocs.map((l, i) => ({ stopIndex: i + 1, name: l.name, lat: l.lat, lng: l.lng })),
      directions: activeRoute.steps ? activeRoute.steps.map(s => ({ step: s.instruction, distance: s.distance })) : []
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `optiroute-itinerary-${routeCategory}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Sync profile forms with authenticated user
  React.useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || (currentUser.email === 'guest@optiroute.local' ? 'Guest User' : ''));
      setProfileEmail(currentUser.email || '');
    } else {
      setProfileName('');
      setProfileEmail('');
    }
    setProfileSaveSuccess(false);
    setProfileSaveError('');
  }, [currentUser]);

  // Scroll to top on every view change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, authEmail, authPassword);
      setCurrentView('mode_select');
      setAuthPassword('');
    } catch (error) {
      console.error("Login error:", error);
      setAuthError('Invalid email or password.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authName || !authEmail || !authPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      const user = userCredential.user;
      
      // Save extra details to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: authName,
        email: authEmail,
        createdAt: new Date().toISOString(),
        history: []
      });

      setCurrentView('mode_select');
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('An account with this email already exists.');
      } else {
        setAuthError('Error creating account. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setCurrentView('home');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const saveSearchToHistory = async (resolvedLocs) => {
    if (!isAuthenticated || !currentUser?.uid) return;

    try {
      const historyItem = {
        waypoints: resolvedLocs.map(l => l.name),
        source: resolvedLocs[0].name,
        destination: resolvedLocs[resolvedLocs.length - 1].name,
        timestamp: new Date().toISOString(),
        transportMode
      };

      await updateDoc(doc(db, "users", currentUser.uid), {
        history: arrayUnion(historyItem)
      });
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const handleHistoryClick = (item) => {
    if (item.waypoints && item.waypoints.length > 0) {
      setWaypoints(item.waypoints);
    } else {
      setWaypoints([item.source, item.destination]);
    }
    if (item.transportMode) setTransportMode(item.transportMode);
  };

  const handleGuestLogin = () => {
    const guestUser = { name: 'Guest User', email: 'guest@optiroute.local' };
    setIsAuthenticated(true);
    setCurrentUser(guestUser);
    setCurrentView('mode_select');
  };
  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...userData, uid: user.uid });
          setSearchHistory(userData.history || []);
        } else {
          // Fallback if doc doesn't exist yet
          setCurrentUser({ email: user.email, uid: user.uid });
        }

        // Real-time subscription to history
        const unsubscribeHistory = onSnapshot(doc(db, "users", user.uid), (doc) => {
          if (doc.exists()) {
            setSearchHistory(doc.data().history || []);
          }
        });
        return () => unsubscribeHistory();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setSearchHistory([]);
      }
    });
    
    // Initial Preloader Timer (2.5 seconds)
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      unsubscribeAuth();
      clearTimeout(loaderTimer);
    };
  }, []);

  // Handle shared deep-links on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const waypointsParam = params.get('waypoints');
    const categoryParam = params.get('category');
    
    if (waypointsParam) {
      const wps = waypointsParam.split(',').map(decodeURIComponent);
      setWaypoints(wps);
      if (categoryParam) {
        setRouteCategory(categoryParam);
        setTransportMode(categoryParam === 'metro' || categoryParam === 'bus' ? 'bus' : categoryParam === 'walking' ? 'walk' : 'car');
      }
      setCurrentView('map');
      
      // Auto-search route after a brief timeout to let map container mount
      setTimeout(() => {
        handleRouteSearch(null, wps);
      }, 800);
    }
  }, []);

  // Demo Mode Logic
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      const runDemo = async () => {
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        setDemoMessage('Welcome to OptiRoute - Intelligent Logistics & Mapping Platform');
        await sleep(3500);
        
        setDemoMessage('Multi-Modal Intelligence: Optimize routes for Car, Bus, Bike, or Walking');
        window.scrollTo({ top: 800, behavior: 'smooth' });
        await sleep(4000);
        
        setDemoMessage('Isometric 3D Mapping for superior perspective analysis');
        await sleep(4000);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setDemoMessage("Let's start our journey. Optimized routes are just a click away.");
        await sleep(3000);
        
        setCurrentView('login');
        setDemoMessage('Flexible Authentication: Sign in or continue as Guest');
        await sleep(3500);
        
        handleGuestLogin();
        setDemoMessage('Interactive Real-time Map with Leaflet integration');
        await sleep(4000);
        
        setDemoMessage('Smart Autocomplete Search with real Indian road data');
        setWaypoints(['Pari Chowk', '']);
        await sleep(2000);
        setWaypoints(['Pari Chowk', 'Knowledge Park III']);
        await sleep(2000);
        
        setDemoMessage('Calculating optimal path using OSRM Routing Engine...');
        handleRouteSearch();
        await sleep(3000);
        
        setDemoMessage('Eco-efficient Insights: Get Fuel estimates, Calories burned, and Fares');
        await sleep(5000);
        
        setDemoMessage('Switch between map modes: Streets or Satellite');
        setMapView('satellite');
        await sleep(3500);
        
        setDemoMessage('Engage 55° Isometric 3D View for immersive navigation');
        setIs3DMode(true);
        await sleep(4500);
        
        setDemoMessage('Premium Dark Mode for reduced eye strain and sleek aesthetics');
        setTheme('dark');
        await sleep(4500);
        
        setDemoMessage('OptiRoute: Mapping smarter journeys, one route at a time.');
        await sleep(5000);
        setDemoMessage('');
      };
      
      // Start demo after preloader
      if (!isLoading) {
        runDemo();
      }
    }
  }, [isLoading]);
  const [is3DMode, setIs3DMode] = React.useState(false);
  const [transportMode, setTransportMode] = React.useState('car');
  const [waypoints, setWaypoints] = React.useState(['', '']);
  const [activeRouteIndex, setActiveRouteIndex] = React.useState(0);
  
  const [activeWaypointIndex, setActiveWaypointIndex] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [routeResult, setRouteResult] = React.useState(null);
  const [theme, setTheme] = React.useState('light');
  const [mapView, setMapView] = React.useState('streets');
  
  // Phase 2 Weather states
  const [weatherData, setWeatherData] = React.useState(null);
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  
  // Phase 3 Elevation states
  const [elevationData, setElevationData] = React.useState(null);
  
  // Phase II States
  const [draggedIdx, setDraggedIdx] = React.useState(null);
  const [departureTime, setDepartureTime] = React.useState("12:00");
  
  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState(false);
  const [routeCategory, setRouteCategory] = React.useState('driving');

  // Performance Optimization: Debounce Search Inputs
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      let filtered = locationsData.filter(loc => 
        loc.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      
      // Sort to float corresponding network nodes to top of search results
      if (routeCategory === 'metro') {
        filtered = filtered.sort((a, b) => {
          const aIsMetro = a.type === 'metro';
          const bIsMetro = b.type === 'metro';
          if (aIsMetro && !bIsMetro) return -1;
          if (!aIsMetro && bIsMetro) return 1;
          return a.name.length - b.name.length;
        });
      } else if (routeCategory === 'airline') {
        filtered = filtered.sort((a, b) => {
          const aIsAir = a.type === 'airline';
          const bIsAir = b.type === 'airline';
          if (aIsAir && !bIsAir) return -1;
          if (!aIsAir && bIsAir) return 1;
          return a.name.length - b.name.length;
        });
      } else if (routeCategory === 'bus') {
        filtered = filtered.sort((a, b) => {
          const aIsBus = a.type === 'bus';
          const bIsBus = b.type === 'bus';
          if (aIsBus && !bIsBus) return -1;
          if (!aIsBus && bIsBus) return 1;
          return a.name.length - b.name.length;
        });
      } else {
        filtered = filtered.sort((a, b) => a.name.length - b.name.length);
      }
      
      const limited = filtered.slice(0, 5); // Limit suggestions for performance
      setSuggestions(limited);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [debouncedSearchQuery, locationsData, routeCategory]);

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
        
        setLocationsData([...data, ...CUSTOM_LOCATIONS]);
      })
      .catch(err => {
        console.error("Could not load locations.csv", err);
        // Fallback to custom presets to prevent UI crashes
        setLocationsData(CUSTOM_LOCATIONS);
      });
  }, []);

  const handleWaypointChange = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
    setActiveWaypointIndex(index);
    setSearchQuery(value);
  };

  const addWaypoint = () => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(newWaypoints.length - 1, 0, '');
    setWaypoints(newWaypoints);
  };

  const removeWaypoint = (index) => {
    if (waypoints.length <= 2) return;
    const newWaypoints = waypoints.filter((_, idx) => idx !== index);
    setWaypoints(newWaypoints);
  };

  const selectWaypoint = (index, name) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = name;
    setWaypoints(newWaypoints);
    setShowDropdown(false);
  };

  // Phase 2 Location functions
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const myLoc = {
          name: "Current Location",
          lat: latitude,
          lng: longitude
        };
        const newWaypoints = [...waypoints];
        newWaypoints[0] = "Current Location";
        setWaypoints(newWaypoints);
        setLocationsData(prev => {
          const filtered = prev.filter(l => l.name !== "Current Location");
          return [...filtered, myLoc];
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  // Phase 2 Weather functions
  const fetchWeatherData = async (destLoc) => {
    if (!destLoc) return;
    setIsWeatherLoading(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${destLoc.lat}&longitude=${destLoc.lng}&current_weather=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.current_weather) {
        setWeatherData(data.current_weather);
      }
    } catch (error) {
      console.error("Weather API error:", error);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const fetchElevationData = async (roadPath) => {
    if (!roadPath || roadPath.length === 0) return;
    
    const maxPoints = 30;
    const sampledPoints = [];
    const step = Math.max(1, Math.floor(roadPath.length / maxPoints));
    
    for (let i = 0; i < roadPath.length; i += step) {
      sampledPoints.push(roadPath[i]);
    }
    if (sampledPoints[sampledPoints.length - 1] !== roadPath[roadPath.length - 1]) {
      sampledPoints.push(roadPath[roadPath.length - 1]);
    }
    
    const lats = sampledPoints.map(p => p[0]).join(',');
    const lngs = sampledPoints.map(p => p[1]).join(',');
    
    try {
      const url = `https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lngs}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.elevation) {
        const chartData = data.elevation.map((el, idx) => {
          return {
            name: `${Math.round((idx / (data.elevation.length - 1)) * 100)}%`,
            elevation: el
          };
        });
        setElevationData(chartData);
      }
    } catch (error) {
      console.error("Elevation API error:", error);
    }
  };

  const getTrafficMultiplier = (timeStr) => {
    const [hourStr, minStr] = timeStr.split(':');
    const hour = parseInt(hourStr) + parseInt(minStr) / 60;
    
    if (hour >= 8 && hour <= 9.5) {
      return 1.45; // Rush hour peak morning
    }
    if (hour >= 17 && hour <= 19.5) {
      return 1.5; // Rush hour peak evening
    }
    if (hour >= 10 && hour <= 16) {
      return 1.15; // Moderate traffic
    }
    if (hour >= 0 && hour <= 5.5) {
      return 0.8; // Night duration reduction
    }
    return 1.0;
  };

  const handleTimeSliderChange = (val) => {
    const hours = Math.floor(val);
    const mins = Math.round((val - hours) * 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    setDepartureTime(timeStr);
  };

  const getSliderValue = (timeStr) => {
    if (!timeStr) return 12;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  const getTrafficLabel = (timeStr) => {
    const trafficMultiplier = getTrafficMultiplier(timeStr);
    if (trafficMultiplier >= 1.4) {
      return { text: 'Heavy Congestion (Rush Hour)', color: 'var(--traffic-red)' };
    } else if (trafficMultiplier >= 1.1) {
      return { text: 'Moderate Traffic', color: 'var(--traffic-yellow)' };
    } else if (trafficMultiplier <= 0.9) {
      return { text: 'Clear Roads (Night)', color: 'var(--traffic-green)' };
    }
    return { text: 'Normal Traffic', color: 'var(--traffic-green)' };
  };

  const getBezierPath = (p1, p2) => {
    const points = [];
    const steps = 60;
    const midLat = (p1.lat + p2.lat) / 2;
    const midLng = (p1.lng + p2.lng) / 2;
    
    // Calculate perpendicular offset based on distance to create a nice curve
    const latOffset = (p2.lng - p1.lng) * 0.2;
    const lngOffset = (p1.lat - p2.lat) * 0.2;
    
    const controlLat = midLat + latOffset;
    const controlLng = midLng + lngOffset;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Quadratic Bezier Formula
      const lat = (1 - t) * (1 - t) * p1.lat + 2 * (1 - t) * t * controlLat + t * t * p2.lat;
      const lng = (1 - t) * (1 - t) * p1.lng + 2 * (1 - t) * t * controlLng + t * t * p2.lng;
      points.push([lat, lng]);
    }
    return points;
  };

  const handleMarkerDrag = async (index, latLng) => {
    const { lat, lng } = latLng;
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=0`;
      const response = await fetch(url, { headers: { 'User-Agent': 'OptiRoute/1.0' } });
      const data = await response.json();
      
      const cleanAddress = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : `Dragged Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      
      const newWaypoints = [...waypoints];
      newWaypoints[index] = cleanAddress;
      setWaypoints(newWaypoints);
      
      const draggedLoc = {
        name: cleanAddress,
        lat: lat,
        lng: lng
      };
      
      setLocationsData(prev => {
        const filtered = prev.filter(l => l.name !== cleanAddress);
        return [...filtered, draggedLoc];
      });
      
      // Explicitly trigger search using updated local copy
      handleRouteSearch(null, newWaypoints);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const optimizeStops = async () => {
    if (waypoints.some(wp => !wp.trim())) {
      alert("Please fill all stop fields before optimizing.");
      return;
    }
    
    const resolved = [];
    for (let wp of waypoints) {
      let loc = findLocation(wp);
      if (!loc) {
        loc = await fetchLocationAPI(wp);
      }
      if (!loc) {
        alert(`Could not resolve location "${wp}" for optimization.`);
        return;
      }
      resolved.push(loc);
    }
    
    if (resolved.length <= 3) {
      alert("Stops optimization requires at least 3 points (Start, End, and at least 1 intermediate stop).");
      return;
    }
    
    const startNode = resolved[0];
    const endNode = resolved[resolved.length - 1];
    const intermediates = resolved.slice(1, resolved.length - 1);
    
    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
    };
    
    const unvisited = [...intermediates];
    const optimizedIntermediates = [];
    let current = startNode;
    
    while (unvisited.length > 0) {
      let closestIdx = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < unvisited.length; i++) {
        const dist = getDistance(current, unvisited[i]);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }
      
      current = unvisited[closestIdx];
      optimizedIntermediates.push(unvisited[closestIdx]);
      unvisited.splice(closestIdx, 1);
    }
    
    const newWaypoints = [
      startNode.name,
      ...optimizedIntermediates.map(l => l.name),
      endNode.name
    ];
    
    setWaypoints(newWaypoints);
    handleRouteSearch(null, newWaypoints);
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
    setWaypoints(['', '']);
    setWeatherData(null);
  };

  const handleRouteSearch = async (e, customWaypoints = waypoints) => {
    if (e && e.preventDefault) e.preventDefault();
    if (customWaypoints.some(wp => !wp.trim())) return;
    
    setIsCalculating(true);
    setRouteResult(null);
    setShowDropdown(false);
    
    const resolvedLocs = [];
    for (let i = 0; i < customWaypoints.length; i++) {
      const wp = customWaypoints[i];
      let loc = findLocation(wp);
      if (!loc) {
        loc = await fetchLocationAPI(wp);
      }
      if (!loc) {
        setIsCalculating(false);
        alert(`Location "${wp}" could not be found. Please check spelling or be more specific.`);
        return;
      }
      resolvedLocs.push(loc);
    }
    
    try {
      if (routeCategory === 'airline') {
        const p1 = resolvedLocs[0];
        const p2 = resolvedLocs[resolvedLocs.length - 1];
        
        const getDistanceKm = (a, b) => {
          const dLat = (b.lat - a.lat) * 111.3;
          const dLng = (b.lng - a.lng) * 111.3 * Math.cos(a.lat * Math.PI / 180);
          return Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
        };
        
        const distanceKm = getDistanceKm(p1, p2);
        
        // Generate curved airway geometries
        const path1 = getBezierPath(p1, p2);
        
        // Alternative path with inverted curve
        const path2 = (() => {
          const points = [];
          const steps = 60;
          const midLat = (p1.lat + p2.lat) / 2;
          const midLng = (p1.lng + p2.lng) / 2;
          const latOffset = (p2.lng - p1.lng) * -0.2;
          const lngOffset = (p1.lat - p2.lat) * -0.2;
          const controlLat = midLat + latOffset;
          const controlLng = midLng + lngOffset;
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lat = (1 - t) * (1 - t) * p1.lat + 2 * (1 - t) * t * controlLat + t * t * p2.lat;
            const lng = (1 - t) * (1 - t) * p1.lng + 2 * (1 - t) * t * controlLng + t * t * p2.lng;
            points.push([lat, lng]);
          }
          return points;
        })();
        
        const allRoutes = [
          { path: path1, name: "Airway Q2 (Direct Flight)" },
          { path: path2, name: "Airway W14 (Alternative Route)" }
        ].map((airway, idx) => {
          const speedKmH = idx === 0 ? 800 : 750;
          const timeMin = Math.round((distanceKm / speedKmH) * 60 + 40);
          const timeString = timeMin >= 60 ? `${Math.floor(timeMin / 60)} hr ${timeMin % 60} min` : `${timeMin} min`;
          
          return {
            roadPath: airway.path,
            distance: `${distanceKm} km`,
            time: timeString,
            traffic: idx === 0 ? 'Clear Airspace' : 'Minor Cloud Delay',
            trafficColor: idx === 0 ? 'var(--traffic-green)' : 'var(--traffic-yellow)',
            fuelSaved: `✈️ Route: ${airway.name} | Jet Fuel: ${(distanceKm * 4.1).toFixed(0)} L | Air Fare: ~₹${Math.round(distanceKm * 6 + 1800)}`,
            routeColor: idx === 0 ? 'var(--primary-color)' : '#9333ea',
            steps: [
              { id: 0, instruction: `Board aircraft gate check-in at ${p1.name}`, distance: 'Departure', lat: p1.lat, lng: p1.lng },
              { id: 1, instruction: `Ascend to flight level FL360 along ${airway.name}`, distance: 'Takeoff', lat: airway.path[15][0], lng: airway.path[15][1] },
              { id: 2, instruction: `Begin descent and align to runway glide-slope`, distance: 'Approach', lat: airway.path[45][0], lng: airway.path[45][1] },
              { id: 3, instruction: `Gate arrival and baggage deplane at ${p2.name}`, distance: 'Touchdown', lat: p2.lat, lng: p2.lng }
            ]
          };
        });
        
        setIsCalculating(false);
        setRouteResult({
          resolvedLocs,
          routes: allRoutes
        });
        setActiveRouteIndex(0);
        saveSearchToHistory(resolvedLocs, allRoutes[0]);
        fetchWeatherData(p2);
      }

      if (routeCategory === 'metro') {
        const p1 = resolvedLocs[0];
        const p2 = resolvedLocs[resolvedLocs.length - 1];

        const getNearestStation = (loc) => {
          if (METRO_STATIONS_DATA[loc.name]) {
            return loc.name;
          }
          let nearestName = null;
          let minDist = Infinity;
          for (const [name, station] of Object.entries(METRO_STATIONS_DATA)) {
            const dLat = station.lat - loc.lat;
            const dLng = station.lng - loc.lng;
            const dist = dLat * dLat + dLng * dLng;
            if (dist < minDist) {
              minDist = dist;
              nearestName = name;
            }
          }
          return nearestName;
        };

        const startStation = getNearestStation(p1);
        const endStation = getNearestStation(p2);

        const findPath = (start, end, avoidNode = null) => {
          if (!METRO_STATIONS_DATA[start] || !METRO_STATIONS_DATA[end]) return null;
          const queue = [[start]];
          const visited = new Set();
          if (avoidNode) visited.add(avoidNode);
          
          while (queue.length > 0) {
            const path = queue.shift();
            const node = path[path.length - 1];
            
            if (node === end) return path;
            
            if (!visited.has(node)) {
              visited.add(node);
              const neighbors = METRO_STATIONS_DATA[node].links;
              for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                  queue.push([...path, neighbor]);
                }
              }
            }
          }
          return null;
        };

        const path1 = findPath(startStation, endStation);
        
        let path2 = null;
        if (path1 && path1.length > 3) {
          const midNode = path1[Math.floor(path1.length / 2)];
          path2 = findPath(startStation, endStation, midNode);
        }

        const routesData = [];
        
        const buildMetroRouteDetails = (stationPath, isExpress = false, routeName = "Optimized Metro Path") => {
          if (!stationPath) return null;
          
          let finalPath = [...stationPath];
          if (isExpress) {
            finalPath = stationPath.filter((station, index) => {
              if (index === 0 || index === stationPath.length - 1) return true;
              const st = METRO_STATIONS_DATA[station];
              if (st.line === 'Aqua Line') {
                return !['Alpha 1 Metro Station', 'Noida Sector 83 Metro Station', 'Noida Sector 50 Metro Station'].includes(station);
              }
              return true;
            });
          }

          const roadPath = finalPath.map(name => {
            const st = METRO_STATIONS_DATA[name];
            return [st.lat, st.lng];
          });

          const segments = [];
          let currentSegment = null;
          for (let i = 0; i < finalPath.length - 1; i++) {
            const nameA = finalPath[i];
            const nameB = finalPath[i+1];
            const sA = METRO_STATIONS_DATA[nameA];
            const sB = METRO_STATIONS_DATA[nameB];
            
            let color = '#94a3b8';
            let line = 'Interchange Transfer';
            
            if (sA.line.includes('Aqua') && sB.line.includes('Aqua')) {
              color = '#00ced1';
              line = 'Aqua Line';
            } else if (sA.line.includes('Blue') && sB.line.includes('Blue')) {
              color = '#0072bb';
              line = 'Blue Line';
            } else if (sA.line.includes('Magenta') && sB.line.includes('Magenta')) {
              color = '#7030a0';
              line = 'Magenta Line';
            } else {
              color = '#ffa500';
              line = 'Interchange Walkway';
            }
            
            if (currentSegment && currentSegment.line === line) {
              currentSegment.path.push([sB.lat, sB.lng]);
            } else {
              if (currentSegment) segments.push(currentSegment);
              currentSegment = {
                line,
                color,
                path: [[sA.lat, sA.lng], [sB.lat, sB.lng]]
              };
            }
          }
          if (currentSegment) segments.push(currentSegment);

          const steps = [];
          let stepId = 0;
          
          if (p1.name !== finalPath[0]) {
            steps.push({
              id: stepId++,
              instruction: `Walk / taxi to ${finalPath[0]}`,
              distance: 'First Leg',
              lat: p1.lat,
              lng: p1.lng,
              color: '#cbd5e1'
            });
          }

          for (let i = 0; i < finalPath.length; i++) {
            const stName = finalPath[i];
            const s = METRO_STATIONS_DATA[stName];
            
            let instruction = '';
            if (i === 0) {
              instruction = `Board train at ${stName} (${s.line})`;
            } else if (i === finalPath.length - 1) {
              instruction = `Arrive at destination: ${stName}`;
            } else {
              const prev = METRO_STATIONS_DATA[finalPath[i-1]];
              if (prev.line !== s.line) {
                instruction = `Transfer to ${stName} (${s.line})`;
              } else {
                instruction = `Stop at ${stName} (${s.line})`;
              }
            }

            steps.push({
              id: stepId++,
              instruction,
              distance: `Stop ${i + 1}`,
              lat: s.lat,
              lng: s.lng,
              color: s.color || '#94a3b8'
            });
          }

          if (p2.name !== finalPath[finalPath.length - 1]) {
            steps.push({
              id: stepId++,
              instruction: `Walk / taxi from ${finalPath[finalPath.length - 1]} to destination: ${p2.name}`,
              distance: 'Last Leg',
              lat: p2.lat,
              lng: p2.lng,
              color: '#cbd5e1'
            });
          }

          const numStations = finalPath.length;
          let distanceKm = 0;
          for (let i = 0; i < roadPath.length - 1; i++) {
            const dLat = (roadPath[i+1][0] - roadPath[i][0]) * 111.3;
            const dLng = (roadPath[i+1][1] - roadPath[i][1]) * 111.3 * Math.cos(roadPath[i][0] * Math.PI / 180);
            distanceKm += Math.sqrt(dLat * dLat + dLng * dLng);
          }
          distanceKm = parseFloat(distanceKm.toFixed(1));

          const timeMin = Math.round((numStations * (isExpress ? 1.4 : 1.8)) + (segments.filter(s => s.line === 'Interchange Walkway').length * 5) + 3);
          const timeString = `${timeMin} min`;
          const fare = Math.round(distanceKm * 2.2 + 10);
          
          return {
            roadPath,
            segments,
            distance: `${distanceKm} km`,
            time: timeString,
            traffic: isExpress ? 'Express Service' : 'On Schedule',
            trafficColor: 'var(--traffic-green)',
            fuelSaved: `🚇 ${routeName} | Fare: ₹${fare}`,
            routeColor: isExpress ? '#00ced1' : '#0072bb',
            steps
          };
        };

        if (path1) {
          routesData.push(buildMetroRouteDetails(path1, false, "Aqua-Blue Direct (Shortest)"));
          
          if (path2 && path2.join(',') !== path1.join(',')) {
            routesData.push(buildMetroRouteDetails(path2, false, "Alternative recommended Route"));
          } else {
            routesData.push(buildMetroRouteDetails(path1, true, "Express Corridor (Recommended)"));
          }
        }

        setIsCalculating(false);
        setRouteResult({
          resolvedLocs,
          routes: routesData
        });
        setActiveRouteIndex(0);
        saveSearchToHistory(resolvedLocs, routesData[0]);
        fetchWeatherData(p2);
        return;
      }

      const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1';
      let profile = 'driving';
      if (transportMode === 'cycle') profile = 'bike';
      if (transportMode === 'walk') profile = 'foot';
      
      const coords = resolvedLocs.map(loc => `${loc.lng},${loc.lat}`).join(';');
      const osrmUrl = `${OSRM_BASE_URL}/${profile}/${coords}?overview=full&geometries=polyline&steps=true&alternatives=true`;
      
      const response = await fetch(osrmUrl);
      const data = await response.json();

      if (data.code !== 'Ok') {
        throw new Error("Could not compute road route.");
      }

      const allRoutes = data.routes.map((route, rIdx) => {
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        let timeMin = Math.round(route.duration / 60);

        // Apply Simulated Traffic Multiplier based on Departure Time
        const trafficMultiplier = getTrafficMultiplier(departureTime);
        if (transportMode === 'car' || transportMode === 'bus') {
          timeMin = Math.round(timeMin * trafficMultiplier);
        }

        if (transportMode === 'bus') {
           timeMin = Math.round(timeMin * 1.5 + 5); 
        } else if (transportMode === 'cycle') {
           timeMin = Math.round(distanceKm * 4); 
        } else if (transportMode === 'walk') {
           timeMin = Math.round(distanceKm * 12); 
        }

        let timeString = `${timeMin} min`;
        if (timeMin >= 60) {
           const hours = Math.floor(timeMin / 60);
           const mins = timeMin % 60;
           timeString = `${hours} hr ${mins} min`;
        }

        let trafficLevel = 'Minimal';
        let trafficColor = 'var(--traffic-green)';
        
        if (transportMode === 'car' || transportMode === 'bus') {
          if (trafficMultiplier >= 1.4) {
            trafficLevel = 'Heavy Congestion (Rush Hour)';
            trafficColor = 'var(--traffic-red)';
          } else if (trafficMultiplier >= 1.1) {
            trafficLevel = 'Moderate Traffic';
            trafficColor = 'var(--traffic-yellow)';
          } else if (trafficMultiplier <= 0.9) {
            trafficLevel = 'Clear Roads (Light)';
            trafficColor = 'var(--traffic-green)';
          } else {
            trafficLevel = 'Normal';
            trafficColor = 'var(--traffic-green)';
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

        const steps = [];
        let stepIdx = 0;
        route.legs.forEach(leg => {
          if (leg.steps) {
            leg.steps.forEach(step => {
              const maneuver = step.maneuver;
              const instruction = (maneuver.type.replace('-', ' ') + ' ' + (maneuver.modifier ? maneuver.modifier.replace('-', ' ') : '') + (step.name ? ` onto ${step.name}` : '')).toLowerCase();
              steps.push({
                id: stepIdx++,
                instruction: instruction.charAt(0).toUpperCase() + instruction.slice(1),
                distance: (step.distance / 1000).toFixed(1) + ' km',
                lat: maneuver.location[1],
                lng: maneuver.location[0]
              });
            });
          }
        });

        return {
          roadPath: polyline.decode(route.geometry),
          distance: `${distanceKm} km`,
          time: routeCategory === 'metro' ? `${Math.round(distanceKm * 1.5 + 4)} min` : timeString,
          traffic: routeCategory === 'metro' ? 'On Schedule' : trafficLevel,
          trafficColor: routeCategory === 'metro' ? 'var(--traffic-green)' : trafficColor,
          fuelSaved: routeCategory === 'metro' ? `🚇 Line: ${rIdx === 0 ? "Rapid Blue Line" : "Rapid Magenta Line"} | Fare: ₹${Math.round(distanceKm * 2.2 + 8)}` : fuelMetric,
          routeColor: routeCategory === 'metro' ? (rIdx === 0 ? '#0072bb' : '#7030a0') : null,
          steps: routeCategory === 'metro' ? [
            { id: 0, instruction: `Enter platform gates at ${resolvedLocs[0].name}`, distance: 'Entry', lat: resolvedLocs[0].lat, lng: resolvedLocs[0].lng },
            { id: 1, instruction: `Board train towards destination hub`, distance: 'Transit', lat: resolvedLocs[0].lat, lng: resolvedLocs[0].lng },
            { id: 2, instruction: `Exit train and clear gates at ${resolvedLocs[resolvedLocs.length - 1].name}`, distance: 'Arrival', lat: resolvedLocs[resolvedLocs.length - 1].lat, lng: resolvedLocs[resolvedLocs.length - 1].lng }
          ] : steps
        };
      });

      setIsCalculating(false);
      setRouteResult({
        resolvedLocs,
        routes: allRoutes
      });
      setActiveRouteIndex(0);

      // Save to Firebase History with distance/duration details
      saveSearchToHistory(resolvedLocs, allRoutes[0]);
      
      // Fetch weather for the destination
      fetchWeatherData(resolvedLocs[resolvedLocs.length - 1]);

    } catch (error) {
      console.error("OSRM Routing error:", error);
      setIsCalculating(false);
      alert("Error calculating road route. Falling back to straight-line estimation.");
      
      const sourceLoc = resolvedLocs[0];
      const destLoc = resolvedLocs[resolvedLocs.length - 1];
      const distanceFlat = Math.sqrt(Math.pow(sourceLoc.lat - destLoc.lat, 2) + Math.pow(sourceLoc.lng - destLoc.lng, 2));
      const distanceKm = (distanceFlat * 111.3).toFixed(1);
      
      const fallbackRoute = {
        roadPath: resolvedLocs.map(l => [l.lat, l.lng]),
        distance: `${distanceKm} km`,
        time: (distanceKm * 2).toFixed(0) + " min",
        traffic: 'N/A',
        trafficColor: 'var(--text-muted)',
        fuelSaved: '',
        steps: []
      };

      setRouteResult({
        resolvedLocs,
        routes: [fallbackRoute]
      });
      setActiveRouteIndex(0);
    }
  };

  // Auto-update route calculations when transport mode or departure time is changed
  React.useEffect(() => {
    if (routeResult && waypoints.every(wp => wp.trim() !== '')) {
       handleRouteSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportMode, departureTime]);

  // Dynamic elevation loading effect for terrain analytics
  React.useEffect(() => {
    const activeRoute = routeResult && routeResult.routes && routeResult.routes[activeRouteIndex];
    if (activeRoute && activeRoute.roadPath && (transportMode === 'cycle' || transportMode === 'walk')) {
      fetchElevationData(activeRoute.roadPath);
     } else {
      setElevationData(null);
    }
  }, [routeResult, activeRouteIndex, transportMode]);

  // Unified premium glassmorphic navigation header
  const renderHeader = () => {
    const handleLogoutClick = () => {
      setProfileDropdownOpen(false);
      handleLogout();
    };

    return (
      <header className="glass-navbar">
        <div className="navbar-container">
          <div className="nav-logo" onClick={() => { setProfileDropdownOpen(false); setCurrentView('home'); }} style={{ cursor: 'pointer' }}>
            <Route className="logo-icon blur-glow" size={28} />
            <span className="logo-text">OptiRoute</span>
          </div>


          <div className="nav-actions">
            <button 
              className="theme-toggle glass-btn" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="avatar-dropdown-wrapper">
                <button 
                  className="avatar-btn glass-panel" 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  title="Profile Menu"
                >
                  <div className="avatar-initials">
                    {profileName ? profileName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </div>
                  <ChevronDown size={14} className={`dropdown-chevron ${profileDropdownOpen ? 'open' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="dropdown-overlay-backdrop" onClick={() => setProfileDropdownOpen(false)}></div>
                    <div className="nav-dropdown-menu animate-slide-down">
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{profileName || 'User'}</div>
                        <div className="dropdown-user-email">{profileEmail || ''}</div>
                        <div className="user-tier-badge">Gold Tier Member</div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item" 
                        type="button"
                        onClick={() => { setProfileDropdownOpen(false); if(isAuthenticated) setCurrentView('mode_select'); else setCurrentView('login'); }}
                      >
                        <MapIcon size={16} /> Choose Network
                      </button>
                      <div className="dropdown-divider"></div>
                      <button type="button" className="dropdown-item logout-btn" onClick={handleLogoutClick}>
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button 
                className="btn btn-primary nav-login-btn" 
                onClick={() => setCurrentView('login')}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    );
  };

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
        {renderHeader()}
        
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


  if (currentView === 'mode_select') {
    const handleSelectMode = (modeType) => {
      setRouteCategory(modeType);
      
      // Preset starting waypoints based on category for standard seamless demo feel
      if (modeType === 'metro') {
        setWaypoints(['Pari Chowk Metro Station', 'Botanical Garden Metro Station']);
        setTransportMode('bus'); // Map routing under the hood uses transit/bus
      } else if (modeType === 'airline') {
        setWaypoints(['Indira Gandhi International Airport (DEL)', 'Chhatrapati Shivaji International Airport (BOM)']);
        setTransportMode('car'); // Map routing displays aviation Bezier path
      } else if (modeType === 'bus') {
        setWaypoints(['Anand Vihar ISBT', 'Pari Chowk Bus Stand']);
        setTransportMode('bus');
      } else if (modeType === 'driving') {
        setWaypoints(['Pari Chowk', 'Knowledge Park III']);
        setTransportMode('car');
      } else if (modeType === 'walking') {
        setWaypoints(['Jagat Farm', 'Alpha 1']);
        setTransportMode('walk');
      }
      
      setRouteResult(null); // Clear previous results
      setCurrentView('map');
    };

    return (
      <div className="home-container" style={{ overflowY: 'auto' }}>
        {renderHeader()}

        <div className="mode-select-content animate-fade-in" style={{ padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setCurrentView('home')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600 }}
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>

          <h1 className="mode-select-title" style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--secondary-color)', textAlign: 'center' }}>Select Transit Network</h1>
          <p className="mode-select-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Choose a network system to optimize. The interface, autocomplete predictions, and mapping coordinates will adjust dynamically to your selection.
          </p>

          <div className="mode-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', justifyContent: 'center' }}>
            {/* Metro Mode Card */}
            <div className="mode-card neon-glow-blue" onClick={() => handleSelectMode('metro')}>
              <div className="mode-card-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Train size={36} />
              </div>
              <h3 className="mode-card-title">Metro Transit Network</h3>
              <p className="mode-card-description">Plan intra-city journeys through local Metro lines. Search autocomplete focuses directly on Metro stations.</p>
              <div className="mode-card-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Noida-Delhi Grid</div>
            </div>

            {/* Airline Mode Card */}
            <div className="mode-card neon-glow-purple" onClick={() => handleSelectMode('airline')}>
              <div className="mode-card-icon" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#a855f7' }}>
                <Plane size={36} />
              </div>
              <h3 className="mode-card-title">Sky Lanes (Aviation)</h3>
              <p className="mode-card-description">Map long-distance flights between national airports. Renders curved geodesic air paths and calculates jet speeds.</p>
              <div className="mode-card-badge" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#a855f7' }}>National Airports</div>
            </div>

            {/* Driving Mode Card */}
            <div className="mode-card neon-glow-green" onClick={() => handleSelectMode('driving')}>
              <div className="mode-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Car size={36} />
              </div>
              <h3 className="mode-card-title">Smart Driving Routes</h3>
              <p className="mode-card-description">Calculate street routes for passenger vehicles. Real-time OSRM engine calculations integrated with simulated traffic conditions.</p>
              <div className="mode-card-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Road Networks</div>
            </div>

            {/* Bus Mode Card */}
            <div className="mode-card neon-glow-indigo" onClick={() => handleSelectMode('bus')}>
              <div className="mode-card-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#6366f1' }}>
                <Bus size={36} />
              </div>
              <h3 className="mode-card-title">Bus Transit Grid</h3>
              <p className="mode-card-description">Navigate city bus terminals and standard bus routes. Search focuses on ISBT networks and local Noida/Delhi bus stops.</p>
              <div className="mode-card-badge" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#6366f1' }}>Regional Transit</div>
            </div>

            {/* Walking Mode Card */}
            <div className="mode-card neon-glow-orange" onClick={() => handleSelectMode('walking')}>
              <div className="mode-card-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Footprints size={36} />
              </div>
              <h3 className="mode-card-title">Walking & Active Paths</h3>
              <p className="mode-card-description">Explore local pedestrian streets, walkways, and park connections. Renders dynamic elevation profiles and active kcal burn metrics.</p>
              <div className="mode-card-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Pedestrian Trails</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'support') {
    const faqs = [
      {
        q: 'How do I plan a multi-stop route?',
        a: 'Open the Planner and select a transit mode. Then add multiple waypoints using the "+" button in the route panel. OptiRoute will automatically optimise the order using the TSP solver.',
      },
      {
        q: 'Which transit networks are currently supported?',
        a: 'OptiRoute supports five networks: Metro Transit (Delhi-NCR lines), Smart Driving (OSRM road engine), Aviation Sky Lanes (national airports), Bus Transit Grid (ISBT & local stops), and Walking & Active Paths.',
      },
      {
        q: 'Why is my route showing an incorrect path?',
        a: 'Route accuracy depends on coordinate geocoding. If a stop is ambiguous, try typing the full address or selecting from the autocomplete dropdown. For Metro/Bus stops, use the exact station name.',
      },
      {
        q: 'Can I export my routes?',
        a: 'Yes. After computing a route, click the Share/Export button in the results panel to copy a deep-link or download a JSON summary of the itinerary including distances, time estimates, and step-by-step turns.',
      },
      {
        q: 'How does the traffic simulation work?',
        a: 'OptiRoute applies time-of-day traffic multipliers to OSRM base travel times. Select a departure time in the Planner to simulate morning rush, midday, or night conditions dynamically.',
      },
      {
        q: 'Is my data stored anywhere?',
        a: 'Route history is stored locally in your browser (localStorage). No route data is sent to external servers. Your account credentials are stored in localStorage only, and no third-party analytics are used.',
      },
    ];

    const handleSupportSend = (e) => {
      e.preventDefault();
      if (!supportName || !supportEmail || !supportMsg) return;
      setSupportSent(true);
    };

    return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {renderHeader()}

        {/* Hero */}
        <section className="support-hero">
          <div className="support-hero-inner">
            <div className="support-hero-badge">Help Center</div>
            <h1 className="support-hero-title">How can we help you?</h1>
            <p className="support-hero-subtitle">Browse our FAQs, send us a message, or reach out through any channel below. Our team typically responds within 24 hours.</p>
          </div>
        </section>

        {/* Cards row */}
        <section className="support-channels-row">
          <div className="support-channel-card">
            <div className="sup-ch-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)' }}>
              <Mail size={26} />
            </div>
            <h3>Email Support</h3>
            <p>Reach us at <strong>support@optiroute.dev</strong> for detailed queries. We respond within 24 hours on business days.</p>
            <a href="mailto:support@optiroute.dev" className="btn btn-outline sup-ch-btn">Send Email</a>
          </div>
          <div className="support-channel-card">
            <div className="sup-ch-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <MessageCircle size={26} />
            </div>
            <h3>Live Chat</h3>
            <p>Chat with a support agent in real time. Available Monday–Friday, 10 AM – 6 PM IST.</p>
            <button type="button" className="btn btn-outline sup-ch-btn" onClick={() => alert('Live chat is coming soon!')}>Start Chat</button>
          </div>
          <div className="support-channel-card">
            <div className="sup-ch-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              <BookOpen size={26} />
            </div>
            <h3>Documentation</h3>
            <p>Explore in-depth guides, API references, and integration tutorials for developers.</p>
            <button type="button" className="btn btn-outline sup-ch-btn" onClick={() => alert('Docs launching soon!')}>Browse Docs</button>
          </div>
        </section>

        {/* FAQ + Contact Form */}
        <section className="support-main-grid">
          {/* FAQ Accordion */}
          <div className="support-faq-col">
            <h2 className="support-section-heading">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span>{item.q}</span>
                    <ChevronDown size={18} className={`faq-chevron ${openFaq === i ? 'rotated' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer animate-fade-in">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="support-form-col">
            <h2 className="support-section-heading">Send a Message</h2>
            {supportSent ? (
              <div className="support-sent-banner animate-fade-in">
                <CheckCircle size={28} />
                <div>
                  <strong>Message received!</strong>
                  <p>Thanks, {supportName}. We'll get back to {supportEmail} within 24 hours.</p>
                </div>
              </div>
            ) : (
              <form className="support-form" onSubmit={handleSupportSend}>
                <div className="support-form-row">
                  <div className="profile-form-group">
                    <label htmlFor="sup-name">Your Name</label>
                    <input id="sup-name" type="text" placeholder="Piyush Gupta" value={supportName} onChange={e => setSupportName(e.target.value)} required />
                  </div>
                  <div className="profile-form-group">
                    <label htmlFor="sup-email">Email Address</label>
                    <input id="sup-email" type="email" placeholder="you@example.com" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="profile-form-group">
                  <label htmlFor="sup-topic">Topic</label>
                  <select id="sup-topic" className="pref-select" style={{ width: '100%', padding: '0.8rem 1rem' }}>
                    <option>Route not working correctly</option>
                    <option>Account / Login issue</option>
                    <option>Feature request</option>
                    <option>API / Developer access</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="profile-form-group">
                  <label htmlFor="sup-msg">Message</label>
                  <textarea id="sup-msg" className="support-textarea" placeholder="Describe your issue or question in detail..." rows={5} value={supportMsg} onChange={e => setSupportMsg(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: '0.75rem', marginTop: '0.25rem' }}>
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Back button */}
        <div style={{ textAlign: 'center', padding: '2rem', marginTop: 'auto' }}>
          <button type="button" className="btn btn-outline" onClick={() => setCurrentView('home')} style={{ borderRadius: '2rem', padding: '0.6rem 1.8rem' }}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'home') {
    const handleCTAClick = () => {
      if (isAuthenticated) {
        setCurrentView('mode_select');
      } else {
        setCurrentView('login');
      }
    };

    return (
      <div className="home-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Radial glow decorators */}
        <div className="hero-radial-glow glow-purple" aria-hidden="true"></div>
        <div className="hero-radial-glow glow-blue" aria-hidden="true"></div>

        {/* Header */}
        {renderHeader()}

        {/* Redesigned Split Hero Section */}
        <section className="hero-section-redesigned">
          <div className="hero-left animate-fade-in">
            <h1 className="hero-title-glowing">
              Navigate Smarter.<br />
              <span className="hero-gradient-text">Avoid Traffic.</span>
            </h1>
            <p className="hero-subtitle-refined">
              Optimize multi-modal logistics with predictive algorithms. Route passenger cars, metro lines, flight lanes, bus timetables, and walking trails with real-time intelligence.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-cta" onClick={handleCTAClick}>
                Get Started Free <Navigation size={20} />
              </button>
              <button className="btn btn-outline" onClick={handleGuestLogin} style={{ borderRadius: '3rem', padding: '1rem 2rem', fontWeight: 600 }}>
                Explore as Guest
              </button>
            </div>
          </div>

          <div className="hero-right animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="simulator-widget">
              <div className="sim-header">
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="sim-dot" style={{ background: '#ef4444' }}></span>
                  <span className="sim-dot" style={{ background: '#fbbf24' }}></span>
                  <span className="sim-dot" style={{ background: '#10b981' }}></span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} color="var(--primary-color)"/> LIVE ROUTE SOLVER
                </div>
              </div>

              <div className="sim-input-box">
                <Navigation size={16} color="var(--traffic-green)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DEPARTURE</span>
                  <span style={{ fontWeight: 600 }}>Indira Gandhi Airport (DEL)</span>
                </div>
              </div>

              <div className="sim-input-box">
                <MapPin size={16} color="var(--traffic-red)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>DESTINATION</span>
                  <span style={{ fontWeight: 600 }}>Pari Chowk Metro Station</span>
                </div>
              </div>

              <div className="sim-visual-path">
                <div className="sim-pulse-line"></div>
                <div style={{ zIndex: 10, display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Plane size={24} color="#a855f7" className="pulse-glow" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontWeight: 600 }}>Aviation</span>
                  </div>
                  <div style={{ width: '40px', borderTop: '2px dashed var(--border-color)' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Train size={24} color="#3b82f6" className="pulse-glow" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontWeight: 600 }}>Metro Link</span>
                  </div>
                </div>
              </div>

              <div className="sim-metric-row">
                <div className="sim-metric-card">
                  <div style={{ color: 'var(--primary-color)', fontWeight: 800 }}>99.8%</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FUEL EFFICIENCY</div>
                </div>
                <div className="sim-metric-card">
                  <div style={{ color: 'var(--traffic-green)', fontWeight: 800 }}>-38 min</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIME SAVED</div>
                </div>
                <div className="sim-metric-card">
                  <div style={{ color: '#fbbf24', fontWeight: 800 }}>No Delay</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TRAFFIC STATUS</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="stats-bar">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-val">99.9%</div>
              <div className="stat-desc">Route Schedule Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">40%+</div>
              <div className="stat-desc">Fuel Cost Savings</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">5+</div>
              <div className="stat-desc">Integrated Transit Networks</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">2.1s</div>
              <div className="stat-desc">Real-Time Routing Compiles</div>
            </div>
          </div>
        </section>

        {/* Featured Networks Showcase */}
        <section className="showcase-header">
          <h2 className="showcase-title">Explore Multi-Modal Systems</h2>
          <p style={{ color: 'var(--text-muted)' }}>Choose from five custom transit networks tailored to optimize specific speeds, costs, and environmental targets.</p>
        </section>

        <section className="features-section" style={{ padding: '0 2rem 8rem', background: 'transparent', borderTop: 'none' }}>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="feature-card animate-fade-in" style={{ padding: '2rem', animationDelay: '0.1s', cursor: 'pointer' }} onClick={handleCTAClick}>
              <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Train size={28} /></div>
              <h3>Metro Transit Grid</h3>
              <p>Aqua, Blue, and Magenta line subway tracking with timetables, specific station stops, transfers, and distance-based fare rates.</p>
            </div>
            
            <div className="feature-card animate-fade-in" style={{ padding: '2rem', animationDelay: '0.2s', cursor: 'pointer' }} onClick={handleCTAClick}>
              <div className="feature-icon" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#a855f7' }}><Plane size={28} /></div>
              <h3>Airline Sky Lanes</h3>
              <p>Compute aviation paths across national airport terminals. Draws curved high-altitude airways bypassing standard street overlays.</p>
            </div>
            
            <div className="feature-card animate-fade-in" style={{ padding: '2rem', animationDelay: '0.3s', cursor: 'pointer' }} onClick={handleCTAClick}>
              <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Car size={28} /></div>
              <h3>Smart Road Networks</h3>
              <p>Real-time vehicle street routing powered by live traffic simulations, congestion scaling, and fuel metric counters.</p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="how-it-works-section">
          <div className="hiw-inner">
            <div className="hiw-header">
              <h2 className="showcase-title">How It Works</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Get from A to B in three intelligent steps.</p>
            </div>
            <div className="hiw-steps">
              <div className="hiw-step animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="hiw-step-num">01</div>
                <div className="hiw-step-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-color)' }}>
                  <User size={28} />
                </div>
                <h3 className="hiw-step-title">Sign In or Guest Mode</h3>
                <p className="hiw-step-desc">Create a free account to unlock saved history and personalized analytics, or jump in instantly as a guest.</p>
              </div>
              <div className="hiw-connector" aria-hidden="true"></div>
              <div className="hiw-step animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <div className="hiw-step-num">02</div>
                <div className="hiw-step-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <Layers size={28} />
                </div>
                <h3 className="hiw-step-title">Pick a Transit Network</h3>
                <p className="hiw-step-desc">Choose from Metro, Driving, Aviation, Bus, or Walking. Each network auto-configures its data sources, autocomplete, and map layers.</p>
              </div>
              <div className="hiw-connector" aria-hidden="true"></div>
              <div className="hiw-step animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="hiw-step-num">03</div>
                <div className="hiw-step-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <Navigation size={28} />
                </div>
                <h3 className="hiw-step-title">Optimize & Navigate</h3>
                <p className="hiw-step-desc">Enter your stops, simulate departure times, compare route alternatives, and export step-by-step directions with fuel and CO₂ metrics.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', background: 'var(--bg-main)', padding: '1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', maxWidth: '1200px', margin: '0 auto', fontSize: '0.82rem' }}>
            {/* Left: Brand logo & copyright */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Route className="logo-icon blur-glow" size={18} color="var(--primary-color)" />
                <span style={{ fontWeight: 800, fontFamily: 'Outfit', color: 'var(--secondary-color)', fontSize: '0.95rem' }}>OptiRoute</span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>|</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2026 DevPythush. All rights reserved.</span>
            </div>

            {/* Middle: Flat Inline Navigation Links */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', color: 'var(--text-muted)' }}>
              <span onClick={() => { if(isAuthenticated) setCurrentView('mode_select'); else setCurrentView('login'); }} style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="footer-hover-link">Planner</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>•</span>
              <span style={{ color: 'var(--text-muted)', opacity: 0.8 }} title="Interactive developer documentation coming soon">Documentation</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>•</span>
              <button type="button" onClick={() => { setCurrentView('support'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)', textDecoration: 'none', cursor: 'pointer', font: 'inherit', fontSize: 'inherit' }} className="footer-hover-link">Support</button>
            </div>

            {/* Right: Operational Status & Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--traffic-green)', display: 'inline-block', boxShadow: '0 0 6px var(--traffic-green)' }}></span>
                <span>Systems Active</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }} title="GitHub">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }} title="Twitter">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

        {demoMessage && (
          <div className="demo-overlay-fixed">
             {demoMessage}
          </div>
        )}
      </div>
    );
  }



  const isCarDisabled = routeCategory !== 'driving';
  const isMetroDisabled = routeCategory !== 'metro';
  const isAirlineDisabled = routeCategory !== 'airline';
  const isBusDisabled = routeCategory !== 'bus';
  const isCycleDisabled = routeCategory !== 'walking';
  const isWalkDisabled = routeCategory !== 'walking';

  return (
    <div className="app-container map-focus-mode">
      {demoMessage && (
        <div className="demo-overlay-fixed">
           {demoMessage}
        </div>
      )}
      
      {/* Floating Header Actions (Top Right) */}
      <div className="map-controls-top-right">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button 
              onClick={() => setCurrentView('home')} 
              className="back-btn"
              title="Return to Home"
              style={{ margin: 0 }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button 
              onClick={() => setCurrentView('mode_select')} 
              className="back-btn"
              title="Change Transit Network"
              style={{ margin: 0, borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
            >
              <Layers size={16} /> Change Mode
            </button>
          </div>
          <div className="logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('home')} title="Return to Home">
            <Route className="logo-icon" size={28} />
            <span>OptiRoute</span>
          </div>
          <p className="planner-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span>Network:</span> 
            <span className={`mode-badge mode-badge-${routeCategory || 'driving'}`} style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
              {routeCategory || 'driving'}
            </span>
          </p>
          {isAuthenticated && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Driver: <strong>{currentUser?.name}</strong></span>
            </div>
          )}
        </div>



        <form className="planner-form" onSubmit={handleRouteSearch}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '0.4rem', borderRadius: '1rem', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => setTransportMode('car')} 
              disabled={isCarDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isCarDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'car' ? 'var(--primary-color)' : 'transparent', 
                color: transportMode === 'car' ? 'white' : 'var(--text-muted)', 
                opacity: isCarDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Driving (Car)"
            >
              <Car size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              type="button" 
              onClick={() => setTransportMode('metro')} 
              disabled={isMetroDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isMetroDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'metro' ? '#3b82f6' : 'transparent', 
                color: transportMode === 'metro' ? 'white' : 'var(--text-muted)', 
                opacity: isMetroDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Metro Transit"
            >
              <Train size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              type="button" 
              onClick={() => setTransportMode('airline')} 
              disabled={isAirlineDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isAirlineDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'airline' ? '#a855f7' : 'transparent', 
                color: transportMode === 'airline' ? 'white' : 'var(--text-muted)', 
                opacity: isAirlineDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Aviation (Airline)"
            >
              <Plane size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              type="button" 
              onClick={() => setTransportMode('bus')} 
              disabled={isBusDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isBusDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'bus' ? '#6366f1' : 'transparent', 
                color: transportMode === 'bus' ? 'white' : 'var(--text-muted)', 
                opacity: isBusDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Public Transit (Bus)"
            >
              <Bus size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              type="button" 
              onClick={() => setTransportMode('cycle')} 
              disabled={isCycleDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isCycleDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'cycle' ? 'var(--primary-color)' : 'transparent', 
                color: transportMode === 'cycle' ? 'white' : 'var(--text-muted)', 
                opacity: isCycleDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Cycling"
            >
              <Bike size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              type="button" 
              onClick={() => setTransportMode('walk')} 
              disabled={isWalkDisabled}
              style={{ 
                flex: 1, 
                minWidth: '35px',
                padding: '0.6rem 0.4rem', 
                borderRadius: '0.75rem', 
                border: 'none', 
                cursor: isWalkDisabled ? 'not-allowed' : 'pointer', 
                background: transportMode === 'walk' ? 'var(--primary-color)' : 'transparent', 
                color: transportMode === 'walk' ? 'white' : 'var(--text-muted)', 
                opacity: isWalkDisabled ? 0.25 : 1,
                transition: 'all 0.2s' 
              }} 
              title="Walking"
            >
              <Footprints size={18} style={{ margin: '0 auto' }} />
            </button>
          </div>

          <div className="route-inputs-container">
            <div className="route-connecting-line" style={{ top: '25px', bottom: '25px', left: '46px' }}></div>
            
            {waypoints.map((wp, idx) => (
              <div 
                key={idx} 
                className={`input-group relative waypoint-input-group ${draggedIdx === idx ? 'dragging' : ''}`} 
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                draggable={true}
                onDragStart={(e) => {
                  setDraggedIdx(idx);
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('text/plain', idx);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (sourceIdx !== idx && !isNaN(sourceIdx)) {
                    const newWaypoints = [...waypoints];
                    const [removed] = newWaypoints.splice(sourceIdx, 1);
                    newWaypoints.splice(idx, 0, removed);
                    setWaypoints(newWaypoints);
                    handleRouteSearch(null, newWaypoints);
                  }
                  setDraggedIdx(null);
                }}
                onDragEnd={() => setDraggedIdx(null)}
              >
                <div 
                  className="drag-handle" 
                  style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0.25rem' }}
                  title="Drag to reorder"
                >
                  <GripVertical size={18} />
                </div>
                <div className="input-with-icon" style={{ flex: 1 }}>
                  {idx === 0 ? (
                    <Navigation className="input-icon" size={18} color="var(--traffic-green)" />
                  ) : idx === waypoints.length - 1 ? (
                    <MapIcon className="input-icon" size={18} color="var(--traffic-red)" />
                  ) : (
                    <MapPin className="input-icon" size={18} color="var(--traffic-yellow)" />
                  )}
                  <input 
                    type="text" 
                    placeholder={idx === 0 ? "Choose starting point" : idx === waypoints.length - 1 ? "Choose destination" : `Stop ${idx}`} 
                    value={wp}
                    onChange={(e) => handleWaypointChange(idx, e.target.value)}
                    onFocus={() => { 
                      setActiveWaypointIndex(idx); 
                      setSearchQuery(wp);
                      if (wp.length > 0) setShowDropdown(true);
                    }}
                    autoComplete="off"
                    required 
                  />
                  
                  {idx === 0 && (
                    <button 
                      type="button" 
                      onClick={getCurrentLocation} 
                      className="gps-btn-input" 
                      title="Use current location"
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}
                    >
                      <Navigation size={16} color="var(--primary-color)" style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  )}
                </div>

                {idx > 0 && idx < waypoints.length - 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeWaypoint(idx)} 
                    className="remove-wp-btn glass-btn" 
                    title="Remove this stop"
                    style={{ padding: '0.5rem', borderRadius: '50%', flexShrink: 0, width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <X size={14} />
                  </button>
                )}
                
                {showDropdown && activeWaypointIndex === idx && suggestions.length > 0 && (
                  <ul className="autocomplete-dropdown glass-dropdown" style={{ width: '100%' }}>
                    {suggestions.map((loc, sIdx) => (
                      <li key={sIdx} onClick={() => selectWaypoint(idx, loc.name)} className="autocomplete-item">
                        <MapPin size={16} className="text-muted" />
                        <span>{loc.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button 
              type="button" 
              onClick={addWaypoint} 
              className="btn btn-outline"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem' }}
            >
              <Plus size={16} /> Add Stop
            </button>
            <button 
              type="button" 
              onClick={optimizeStops} 
              className="btn btn-outline"
              title="Optimize Stops order (TSP)"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.75rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
            >
              <TrendingUp size={16} /> Optimize
            </button>
          </div>

          {/* Rush Hour Traffic Simulator */}
          <div className="departure-time-simulator" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} /> Departure Time
              </span>
              <span style={{ color: 'var(--primary-color)' }}>
                {(() => {
                  const [h, m] = departureTime.split(':').map(Number);
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  const displayHour = h % 12 === 0 ? 12 : h % 12;
                  const displayMin = m.toString().padStart(2, '0');
                  return `${displayHour}:${displayMin} ${ampm}`;
                })()}
              </span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="23.5" 
              step="0.5" 
              value={getSliderValue(departureTime)} 
              onChange={(e) => handleTimeSliderChange(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
            
            <div style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              color: getTrafficLabel(departureTime).color,
              fontWeight: 500
            }}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: getTrafficLabel(departureTime).color 
              }}></span>
              <span>Simulated Traffic: {getTrafficMultiplier(departureTime).toFixed(2)}x ({getTrafficLabel(departureTime).text})</span>
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

        {/* Recent Search History Section */}
        {isAuthenticated && searchHistory.length > 0 && (
          <div className="search-history-section animate-fade-in" style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0 1rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>
              <Clock size={18} />
              Recent Journeys
            </div>
            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {searchHistory.slice().reverse().slice(0, 5).map((item, idx) => (
                <div 
                  key={idx} 
                  className="history-item glass-panel" 
                  onClick={() => handleHistoryClick(item)}
                  style={{ 
                    padding: '0.85rem', 
                    borderRadius: '0.75rem', 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      {item.transportMode === 'car' && <Car size={14} />}
                      {item.transportMode === 'bus' && <Bus size={14} />}
                      {item.transportMode === 'cycle' && <Bike size={14} />}
                      {item.transportMode === 'walk' && <Footprints size={14} />}
                      <span>{item.source}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', paddingLeft: '1.25rem' }}>
                    <div style={{ width: '1px', height: '10px', background: 'var(--border-color)' }}></div>
                    <span>{item.destination}</span>
                    {item.waypoints && item.waypoints.length > 2 && (
                      <span style={{ fontSize: '0.75rem', background: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                        +{item.waypoints.length - 2} stops
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section inside Planner */}
        {routeResult && routeResult.routes && routeResult.routes[activeRouteIndex] && (() => {
          const activeRoute = routeResult.routes[activeRouteIndex];
          return (
            <div className="route-results-container animate-fade-in">
              {/* Alternative Route Selectors & Comparison Matrix */}
              {routeResult.routes.length > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div className="alternative-routes-selector">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Alternative Routes:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {routeResult.routes.map((rt, rIdx) => (
                        <div 
                          key={rIdx} 
                          onClick={() => setActiveRouteIndex(rIdx)}
                          className={`alternative-route-card ${rIdx === activeRouteIndex ? 'active' : ''}`}
                        >
                          <div style={{ fontWeight: 600 }}>
                            Route {rIdx + 1} {rIdx === 0 && <span style={{ fontSize: '0.75rem', background: 'var(--traffic-green)', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px', fontWeight: 500 }}>Fastest</span>}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {rt.time} • {rt.distance}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Matrix Table */}
                  <div className="route-comparison-matrix">
                    <div className="route-comparison-matrix-title">
                      <Layers size={14} color="var(--primary-color)" /> Route Comparison Matrix
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Option</th>
                            <th>Time</th>
                            <th>Distance</th>
                            <th>Traffic</th>
                          </tr>
                        </thead>
                        <tbody>
                          {routeResult.routes.map((rt, rIdx) => (
                            <tr 
                              key={rIdx} 
                              onClick={() => setActiveRouteIndex(rIdx)}
                              className={rIdx === activeRouteIndex ? 'active-row' : ''}
                            >
                              <td style={{ color: rIdx === activeRouteIndex ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 600 }}>
                                R{rIdx + 1} {rIdx === 0 && <span style={{ fontSize: '0.65rem', color: 'var(--traffic-green)', marginLeft: '2px' }}>★</span>}
                              </td>
                              <td style={{ color: 'var(--text-main)' }}>{rt.time}</td>
                              <td style={{ color: 'var(--text-muted)' }}>{rt.distance}</td>
                              <td style={{ color: rt.trafficColor, fontWeight: 600 }}>{rt.traffic.split(' ')[0]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="route-overview">
                <div className="trip-time">{activeRoute.time}</div>
                <div className="trip-distance">{activeRoute.distance} • <span style={{color: activeRoute.trafficColor}}>{activeRoute.traffic} Traffic</span></div>
                {activeRoute.fuelSaved && (
                   <div className="fuel-saved-badge mt-2" style={{ color: 'var(--traffic-green)', fontSize: '0.9rem', fontWeight: 600 }}>
                      {activeRoute.fuelSaved}
                   </div>
                )}
                
                {/* Weather widget */}
                {weatherData && (
                  <div className="weather-badge mt-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', background: 'var(--bg-main)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', width: 'fit-content' }}>
                    <CloudSun size={16} color="var(--primary-color)" />
                    <span>Destination Weather: <strong>{weatherData.temperature}°C</strong></span>
                  </div>
                )}

                {/* Share & Export Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '0.5rem' }}
                    onClick={handleShareRoute}
                  >
                    <Send size={14} /> {isRouteShared ? 'Copied Link!' : 'Share Route'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '0.5rem' }}
                    onClick={handleExportItinerary}
                  >
                    <Layers size={14} /> Export JSON
                  </button>
                </div>
              </div>
              
              <div className="route-breakdown">
                  <strong>Stops List:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {routeResult.resolvedLocs.map((loc, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: idx === 0 ? 'var(--traffic-green)' : idx === routeResult.resolvedLocs.length - 1 ? 'var(--traffic-red)' : 'var(--traffic-yellow)' 
                        }}></div>
                        <span style={{ color: idx === 0 || idx === routeResult.resolvedLocs.length - 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {loc.name}
                        </span>
                      </div>
                    ))}
                  </div>
              </div>

              {activeRoute.steps && activeRoute.steps.length > 0 && (
                  <div className="route-steps" style={{ marginTop: '1rem' }}>
                    <h4 style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>Step-by-Step Directions</h4>
                    <ul className="steps-list" style={{ maxHeight: '160px', overflowY: 'auto', listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                      {activeRoute.steps.map(step => (
                          <li key={step.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                               {routeCategory === 'metro' && step.color && (
                                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: step.color, border: '1.5px solid white', boxShadow: '0 0 4px rgba(0,0,0,0.25)', flexShrink: 0 }} />
                               )}
                               <span style={{color: 'var(--text-main)'}}>{step.instruction}</span>
                             </div>
                             <span style={{color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>{step.distance}</span>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}
              {/* Elevation Profile Chart for biking and walking */}
              {elevationData && (transportMode === 'cycle' || transportMode === 'walk') && (
                <div className="elevation-profile-container" style={{ padding: '1rem 0 0', borderTop: '1px solid var(--border-color)', marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <TrendingUp size={16} color="var(--primary-color)" />
                    <span>Terrain Elevation (Difficulty profile)</span>
                  </div>
                  <div style={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={elevationData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                        <ChartTooltip 
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-main)' }} 
                          labelStyle={{ color: 'var(--text-muted)' }}
                        />
                        <Area type="monotone" dataKey="elevation" stroke="var(--primary-color)" fill="rgba(79, 70, 229, 0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
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
 
           {routeResult && routeResult.resolvedLocs && (
             <>
               {routeResult.resolvedLocs.map((loc, idx) => {
                 let icon = intermediateIcon;
                 let title = `Stop ${idx}`;
                 
                 if (routeCategory === 'airline') {
                   icon = planeIcon;
                   title = idx === 0 ? "Departure Airport" : idx === routeResult.resolvedLocs.length - 1 ? "Arrival Airport" : "Stopover";
                 } else if (routeCategory === 'metro') {
                   icon = metroIcon;
                   title = idx === 0 ? "Start Metro Station" : idx === routeResult.resolvedLocs.length - 1 ? "Destination Metro Station" : "Metro Station Hub";
                 } else if (routeCategory === 'bus') {
                   icon = busIcon;
                   title = idx === 0 ? "Start Bus Stand" : idx === routeResult.resolvedLocs.length - 1 ? "Destination Bus Stand" : "Bus Stop Depot";
                 } else {
                   if (idx === 0) {
                     icon = startIcon;
                     title = "Start";
                   } else if (idx === routeResult.resolvedLocs.length - 1) {
                     icon = endIcon;
                     title = "Destination";
                   }
                 }
                 
                 return (
                   <Marker 
                     key={idx} 
                     position={[loc.lat, loc.lng]} 
                     icon={icon}
                     draggable={true}
                     eventHandlers={{
                       dragend: (e) => {
                         const marker = e.target;
                         const position = marker.getLatLng();
                         handleMarkerDrag(idx, position);
                       }
                     }}
                   >
                     <Popup><b>{title}:</b> {loc.name}</Popup>
                   </Marker>
                 );
               })}

               {routeResult.routes && routeResult.routes.map((rt, idx) => {
                  const isActive = idx === activeRouteIndex;
                  if (isActive && routeCategory === 'metro' && rt.segments) {
                    return rt.segments.map((seg, sIdx) => (
                      <Polyline 
                        key={`metro-seg-${idx}-${sIdx}`}
                        positions={seg.path} 
                        color={seg.color} 
                        weight={6} 
                        opacity={0.95}
                        dashArray={seg.line === 'Interchange Walkway' ? "5, 5" : null}
                        eventHandlers={{
                          click: () => setActiveRouteIndex(idx)
                        }}
                      >
                        <Popup><b>{seg.line}</b></Popup>
                      </Polyline>
                    ));
                  }
                  
                  return (
                    <Polyline 
                      key={idx}
                      positions={rt.roadPath} 
                      color={rt.routeColor ? rt.routeColor : (isActive ? (mapView === 'satellite' ? '#3b82f6' : 'var(--primary-color)') : '#94a3b8')} 
                      weight={isActive ? (routeCategory === 'airline' ? 5 : 6) : 4} 
                      opacity={isActive ? 0.9 : 0.4}
                      dashArray={routeCategory === 'airline' ? "8, 8" : null}
                      eventHandlers={{
                        click: () => setActiveRouteIndex(idx)
                      }}
                    />
                  );
                })}

               {routeResult.routes && routeResult.routes[activeRouteIndex] && routeResult.routes[activeRouteIndex].steps && (
                 <>
                   {routeResult.routes[activeRouteIndex].steps.map(step => {
                      const circleColor = routeCategory === 'metro' && step.color ? step.color : 'var(--primary-color)';
                      return (
                       <CircleMarker 
                          key={step.id} 
                          center={[step.lat, step.lng]} 
                          radius={6} 
                          pathOptions={{ color: 'white', fillColor: circleColor, fillOpacity: 1, weight: 2 }}
                       >
                          <Popup><b>{step.distance}:</b> {step.instruction}</Popup>
                       </CircleMarker>
                      );
                    })}
                 </>
               )}
               <MapUpdater routeResult={routeResult} activeRouteIndex={activeRouteIndex} />
             </>
           )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
