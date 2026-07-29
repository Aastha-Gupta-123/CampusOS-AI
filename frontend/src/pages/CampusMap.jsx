import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, MapPin, Navigation, Filter, Compass, Building2, BookOpen, Coffee, Home, Dumbbell, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notify from '../services/toast';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Sri Eshwar College of Engineering, Coimbatore coordinates
const COLLEGE_CENTER = [11.0340, 77.0010];

// Color-coded icons per category
const categoryColors = {
  academic:    '#3b82f6',
  department:  '#6366f1',
  lab:         '#8b5cf6',
  library:     '#f59e0b',
  cafeteria:   '#f97316',
  hostel:      '#10b981',
  admin:       '#ef4444',
  sports:      '#06b6d4',
  facility:    '#84cc16',
  innovation:  '#ec4899',
  transport:   '#64748b',
  other:       '#94a3b8',
};

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

// All campus locations with real-ish coordinates spread around the college
const campusLocations = [
  // Academic Blocks
  { id: 1, name: 'Academic Block A', category: 'academic', lat: 11.0345, lng: 77.0015, block: 'A', floor: 'G, 1, 2, 3', description: 'Main academic block — CSE, AI/ML, Data Science departments', icon: Building2 },
  { id: 2, name: 'Academic Block B', category: 'academic', lat: 11.0338, lng: 77.0020, block: 'B', floor: 'G, 1, 2, 3', description: 'Mechanical, Civil Engineering departments', icon: Building2 },
  { id: 3, name: 'Academic Block C', category: 'academic', lat: 11.0332, lng: 77.0018, block: 'C', floor: 'G, 1, 2', description: 'ECE, EEE departments and Auditorium', icon: Building2 },
  // Departments
  { id: 4, name: 'CSE Department', category: 'department', lat: 11.0346, lng: 77.0014, block: 'A', floor: '1st Floor, Room A105', description: 'Computer Science & Engineering', icon: Compass },
  { id: 5, name: 'AI Lab', category: 'lab', lat: 11.0347, lng: 77.0013, block: 'A', floor: '1st Floor, Room A108', description: 'NVIDIA GPU workstations for deep learning', icon: FlaskConical },
  { id: 6, name: 'Computer Lab', category: 'lab', lat: 11.0344, lng: 77.0016, block: 'A', floor: '2nd Floor, Room A208', description: '100+ workstations for programming', icon: FlaskConical },
  // Library
  { id: 7, name: 'Central Library', category: 'library', lat: 11.0343, lng: 77.0012, block: 'A', floor: '2nd Floor, Room A201-A204', description: '50,000+ books, digital resources, reading halls', icon: BookOpen },
  // Cafeteria
  { id: 8, name: 'Main Cafeteria', category: 'cafeteria', lat: 11.0336, lng: 77.0022, block: 'D', floor: 'Ground Floor', description: 'Breakfast, lunch, snacks — veg & non-veg', icon: Coffee },
  // Hostels
  { id: 9, name: 'Boys Hostel 1', category: 'hostel', lat: 11.0328, lng: 77.0008, block: 'G', floor: '1, 2, 3', description: 'Four-seater rooms, Wi-Fi, 300 students', icon: Home },
  { id: 10, name: 'Boys Hostel 2', category: 'hostel', lat: 11.0325, lng: 77.0012, block: 'H', floor: '1, 2, 3', description: 'Three-seater rooms, modern amenities', icon: Home },
  { id: 11, name: 'Girls Hostel', category: 'hostel', lat: 11.0330, lng: 77.0005, block: 'I', floor: '1, 2, 3', description: '24/7 security, warden availability', icon: Home },
  // Admin
  { id: 12, name: 'Administrative Office', category: 'admin', lat: 11.0350, lng: 77.0010, block: 'A', floor: 'Ground, Room A001', description: 'Admissions, fees, student records', icon: Building2 },
  { id: 13, name: 'Placement Cell', category: 'admin', lat: 11.0348, lng: 77.0009, block: 'A', floor: '3rd Floor, Room A310', description: 'Campus recruitment, internships, career guidance', icon: Building2 },
  { id: 14, name: 'Principal\'s Office', category: 'admin', lat: 11.0351, lng: 77.0011, block: 'A', floor: 'Ground, Room A003', description: 'Office of the Principal', icon: Building2 },
  // Sports
  { id: 15, name: 'Sports Complex', category: 'sports', lat: 11.0334, lng: 77.0025, block: 'E', floor: 'Ground, 1st Floor', description: 'Basketball, badminton, table tennis, gymnasium', icon: Dumbbell },
  { id: 16, name: 'College Ground', category: 'sports', lat: 11.0330, lng: 77.0028, block: 'E', floor: 'Ground', description: 'Cricket, football, athletics', icon: Dumbbell },
  // Innovation
  { id: 17, name: 'Innovation Center', category: 'innovation', lat: 11.0342, lng: 77.0017, block: 'A', floor: '2nd Floor, Room A212', description: 'Student startups, project incubation', icon: Compass },
  { id: 18, name: 'Incubation Center', category: 'innovation', lat: 11.0337, lng: 77.0021, block: 'B', floor: '3rd Floor, Room B310', description: 'Startup workspace, mentorship', icon: Compass },
  // Facilities
  { id: 19, name: 'Main Gate', category: 'transport', lat: 11.0355, lng: 77.0010, block: 'Front', floor: 'Ground', description: 'Main entrance with security check', icon: MapPin },
  { id: 20, name: 'Main Auditorium', category: 'facility', lat: 11.0331, lng: 77.0016, block: 'C', floor: 'Ground, Room C001', description: '1000-seat auditorium for events', icon: Building2 },
  { id: 21, name: 'Medical Room', category: 'facility', lat: 11.0349, lng: 77.0008, block: 'A', floor: '1st Floor, Room A104', description: 'First aid, nurse on duty', icon: Building2 },
];

const categoryIcons = {
  academic:   Building2,
  department: Compass,
  lab:        FlaskConical,
  library:    BookOpen,
  cafeteria:  Coffee,
  hostel:     Home,
  admin:      Building2,
  sports:     Dumbbell,
  facility:   Building2,
  innovation: Compass,
  transport:  MapPin,
};

const allCategories = [...new Set(campusLocations.map(l => l.category))];

function FlyToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 18, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

export default function CampusMap() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const navigate = useNavigate();

  const filtered = activeCategory === 'all'
    ? campusLocations
    : campusLocations.filter(l => l.category === activeCategory);

  const handleMarkerClick = (loc) => {
    setSelectedLocation(loc);
  };

  const handleNavigate = (loc) => {
    notify.success(`Opening Navigation AI for "${loc.name}"`);
    navigate(`/navigation?q=${encodeURIComponent(loc.name)}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 p-5">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Interactive Campus Map</h2>
            <p className="text-teal-100/70 text-xs">Sri Eshwar College of Engineering · {campusLocations.length} locations mapped</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <span className="badge bg-white/20 text-white border-white/20 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Map
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="glass-card rounded-2xl p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                : 'bg-white dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.07] hover:border-primary-300'
            }`}
          >
            All ({campusLocations.length})
          </button>
          {allCategories.map(cat => {
            const count = campusLocations.filter(l => l.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 capitalize ${
                  activeCategory === cat
                    ? 'text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.07] hover:border-primary-300'
                }`}
                style={activeCategory === cat ? { backgroundColor: categoryColors[cat] } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Map */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden" style={{ height: '520px' }}>
          <MapContainer
            center={COLLEGE_CENTER}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            className="rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {flyTarget && <FlyToLocation location={flyTarget} />}
            {filtered.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={createColorIcon(categoryColors[loc.category] || '#94a3b8')}
                eventHandlers={{ click: () => handleMarkerClick(loc) }}
              >
                <Popup>
                  <div className="min-w-[200px] p-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[loc.category] }} />
                      <span className="text-xs font-bold text-gray-900 capitalize">{loc.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{loc.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">📍 Block {loc.block} · {loc.floor}</p>
                    <p className="text-xs text-gray-600 mb-3">{loc.description}</p>
                    <button
                      onClick={() => handleNavigate(loc)}
                      className="w-full text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      🧭 Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Location List */}
        <div className="glass-card rounded-2xl p-4 flex flex-col" style={{ height: '520px' }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Locations <span className="text-gray-400 font-normal">({filtered.length})</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filtered.map((loc, i) => {
              const IconComp = categoryIcons[loc.category] || MapPin;
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <motion.button
                  key={loc.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => { setSelectedLocation(loc); setFlyTarget(loc); }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/30'
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: categoryColors[loc.category] + '20' }}>
                    <IconComp className="w-3.5 h-3.5" style={{ color: categoryColors[loc.category] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{loc.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Block {loc.block}</p>
                  </div>
                  {isSelected && <Navigation className="w-3.5 h-3.5 text-primary-500 shrink-0" />}
                </motion.button>
              );
            })}
          </div>

          {selectedLocation && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">{selectedLocation.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">{selectedLocation.description}</p>
              <button
                onClick={() => handleNavigate(selectedLocation)}
                className="btn-primary text-xs w-full justify-center py-2"
              >
                <Navigation className="w-3.5 h-3.5" /> Get AI Directions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Map Legend</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {allCategories.map(cat => (
            <div key={cat} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[cat] }} />
              <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
