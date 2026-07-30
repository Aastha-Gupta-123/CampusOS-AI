import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Navigation, X, Building2, BookOpen, FlaskConical,
  Utensils, Home, Bus, Shield, Dumbbell, Lightbulb, DoorOpen, MoreHorizontal,
  Clock, ChevronRight, Layers } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Map } from 'lucide-react';

// Sri Eshwar College of Engineering, Coimbatore — real coordinates
const COLLEGE_CENTER = [11.0340, 77.0010];

// All 43 locations with assigned coordinates spread across the campus grid
const ALL_LOCATIONS = [
  // Academic Blocks
  { id:'block_a', name:'Academic Block A', block:'A', floor:'Ground-3', category:'academic_blocks', color:'#3b82f6', lat:11.0345, lng:77.0008, description:'Main academic block — CSE, classrooms, faculty offices.', walking_time_minutes:2 },
  { id:'block_b', name:'Academic Block B', block:'B', floor:'Ground-3', category:'academic_blocks', color:'#3b82f6', lat:11.0340, lng:77.0018, description:'Mechanical, Civil Engineering and related labs.', walking_time_minutes:4 },
  { id:'block_c', name:'Academic Block C', block:'C', floor:'Ground-2', category:'academic_blocks', color:'#3b82f6', lat:11.0335, lng:77.0025, description:'ECE, EEE departments.', walking_time_minutes:5 },
  // Departments
  { id:'cse', name:'Computer Science & Engineering', block:'A', floor:'1', room:'A105', category:'departments', color:'#8b5cf6', lat:11.0346, lng:77.0007, description:'CSE dept — faculty offices, research labs, smart classrooms.', walking_time_minutes:2 },
  { id:'ece', name:'Electronics & Communication Engg', block:'C', floor:'1', room:'C105', category:'departments', color:'#8b5cf6', lat:11.0334, lng:77.0026, description:'ECE dept — VLSI lab, communication lab.', walking_time_minutes:5 },
  { id:'eee', name:'Electrical & Electronics Engg', block:'C', floor:'2', room:'C205', category:'departments', color:'#8b5cf6', lat:11.0333, lng:77.0027, description:'EEE dept — power systems lab, electrical machines lab.', walking_time_minutes:5 },
  { id:'mech', name:'Mechanical Engineering', block:'B', floor:'Ground', room:'B010', category:'departments', color:'#8b5cf6', lat:11.0341, lng:77.0019, description:'Mech dept — CAD lab, workshop.', walking_time_minutes:3 },
  { id:'civil', name:'Civil Engineering', block:'B', floor:'1', room:'B110', category:'departments', color:'#8b5cf6', lat:11.0342, lng:77.0017, description:'Civil dept — surveying lab, materials testing.', walking_time_minutes:4 },
  { id:'aiml', name:'AI and Machine Learning', block:'A', floor:'2', room:'A205', category:'departments', color:'#8b5cf6', lat:11.0347, lng:77.0006, description:'AI/ML dept — GPU workstations for deep learning.', walking_time_minutes:2 },
  { id:'ds', name:'Data Science', block:'A', floor:'2', room:'A210', category:'departments', color:'#8b5cf6', lat:11.0348, lng:77.0005, description:'Data Science — analytics, big data, statistical computing.', walking_time_minutes:2 },
  { id:'it', name:'Information Technology', block:'A', floor:'3', room:'A305', category:'departments', color:'#8b5cf6', lat:11.0349, lng:77.0004, description:'IT dept — networking labs, cybersecurity lab.', walking_time_minutes:3 },
  // Labs
  { id:'ai_lab', name:'AI Lab', block:'A', floor:'1', room:'A108', category:'labs', color:'#10b981', lat:11.0344, lng:77.0009, description:'NVIDIA GPU workstations for deep learning and computer vision.', walking_time_minutes:1 },
  { id:'computer_lab', name:'Computer Lab', block:'A', floor:'2', room:'A208', category:'labs', color:'#10b981', lat:11.0345, lng:77.0010, description:'100+ workstations for programming and practical exams.', walking_time_minutes:2 },
  { id:'physics_lab', name:'Physics Lab', block:'B', floor:'2', room:'B205', category:'labs', color:'#10b981', lat:11.0339, lng:77.0020, description:'Optics, mechanics, and electronics experiment setups.', walking_time_minutes:3 },
  { id:'chemistry_lab', name:'Chemistry Lab', block:'B', floor:'2', room:'B210', category:'labs', color:'#10b981', lat:11.0338, lng:77.0021, description:'Fume hoods, analytical instruments, safety equipment.', walking_time_minutes:3 },
  { id:'research_lab', name:'Research Lab', block:'B', floor:'3', room:'B305', category:'labs', color:'#10b981', lat:11.0337, lng:77.0022, description:'Advanced research for PG and PhD across engineering disciplines.', walking_time_minutes:4 },
  // Library
  { id:'central_library', name:'Central Library', block:'A', floor:'2', room:'A201-A204', category:'library', color:'#f59e0b', lat:11.0343, lng:77.0011, description:'50,000+ books, digital resources, reading halls.', walking_time_minutes:2 },
  // Seminar Halls
  { id:'seminar_hall_1', name:'Seminar Hall (Block B)', block:'B', floor:'Ground', room:'B002', category:'seminar_halls', color:'#06b6d4', lat:11.0341, lng:77.0016, description:'150-seat hall with AV equipment.', walking_time_minutes:3 },
  { id:'seminar_hall_2', name:'Seminar Hall (Block A)', block:'A', floor:'Ground', room:'A002', category:'seminar_halls', color:'#06b6d4', lat:11.0344, lng:77.0006, description:'100-seat hall for departmental seminars.', walking_time_minutes:1 },
  // Auditorium
  { id:'main_auditorium', name:'Main Auditorium', block:'C', floor:'Ground', room:'C001', category:'auditoriums', color:'#ec4899', lat:11.0332, lng:77.0028, description:'1000-seat auditorium for cultural events and convocations.', walking_time_minutes:5 },
  // Cafeteria
  { id:'main_cafeteria', name:'Main Cafeteria', block:'D', floor:'Ground', room:'D001', category:'cafeteria', color:'#f97316', lat:11.0336, lng:77.0015, description:'Breakfast, lunch, snacks — veg and non-veg options.', walking_time_minutes:3 },
  // Hostels
  { id:'boys_hostel_1', name:'Boys Hostel 1', block:'G', floor:'1-3', room:'G-Block', category:'hostels', color:'#64748b', lat:11.0328, lng:77.0005, description:'Four-seater rooms, attached bathroom, Wi-Fi. 300 students.', walking_time_minutes:8 },
  { id:'boys_hostel_2', name:'Boys Hostel 2', block:'H', floor:'1-3', room:'H-Block', category:'hostels', color:'#64748b', lat:11.0326, lng:77.0008, description:'Three-seater rooms, modern amenities, 24/7 security.', walking_time_minutes:10 },
  { id:'girls_hostel', name:'Girls Hostel', block:'I', floor:'1-3', room:'I-Block', category:'hostels', color:'#64748b', lat:11.0327, lng:77.0012, description:'24/7 security, warden availability, recreational facilities.', walking_time_minutes:7 },
  // Transportation
  { id:'bus_parking', name:'Bus Parking', block:'F', floor:'Ground', room:'Open Area', category:'transportation', color:'#84cc16', lat:11.0352, lng:77.0000, description:'Main bus parking for college buses and student transport.', walking_time_minutes:1 },
  { id:'parking_lot', name:'Parking Lot', block:'F', floor:'Ground', room:'Open Area', category:'transportation', color:'#84cc16', lat:11.0351, lng:77.0002, description:'Staff and student vehicle parking.', walking_time_minutes:1 },
  // Administrative
  { id:'admin_office', name:'Administrative Office', block:'A', floor:'Ground', room:'A001', category:'administrative', color:'#ef4444', lat:11.0343, lng:77.0007, description:'Admissions, fees, student records, general inquiries.', walking_time_minutes:1 },
  { id:'principal_office', name:"Principal's Office", block:'A', floor:'Ground', room:'A003', category:'administrative', color:'#ef4444', lat:11.0342, lng:77.0008, description:"Office of the Principal, Sri Eshwar College of Engineering.", walking_time_minutes:1 },
  // Student Services
  { id:'placement_cell', name:'Placement Cell', block:'A', floor:'3', room:'A310', category:'student_services', color:'#a855f7', lat:11.0350, lng:77.0003, description:'Campus recruitment, internships, career guidance.', walking_time_minutes:3 },
  { id:'exam_cell', name:'Exam Cell', block:'A', floor:'3', room:'A315', category:'student_services', color:'#a855f7', lat:11.0350, lng:77.0004, description:'Semester exams, hall tickets, results, academic records.', walking_time_minutes:3 },
  { id:'reception', name:'Reception', block:'A', floor:'Ground', room:'A000', category:'student_services', color:'#a855f7', lat:11.0341, lng:77.0006, description:'Visitor inquiries, guest registration, information.', walking_time_minutes:1 },
  { id:'security_office', name:'Security Office', block:'A', floor:'Ground', room:'A000', category:'student_services', color:'#a855f7', lat:11.0340, lng:77.0006, description:'Campus security monitoring entry/exit and safety.', walking_time_minutes:1 },
  // Facilities
  { id:'sports_complex', name:'Sports Complex', block:'E', floor:'Ground-1', room:'E-Block', category:'facilities', color:'#14b8a6', lat:11.0330, lng:77.0020, description:'Basketball, badminton, table tennis, gymnasium, chess room.', walking_time_minutes:4 },
  { id:'ground', name:'College Ground', block:'E', floor:'Ground', room:'Open Area', category:'facilities', color:'#14b8a6', lat:11.0328, lng:77.0022, description:'Cricket, football, athletics, and college events.', walking_time_minutes:5 },
  { id:'medical_room', name:'Medical Room', block:'A', floor:'1', room:'A104', category:'facilities', color:'#14b8a6', lat:11.0344, lng:77.0008, description:'First aid and basic medical care, nurse on duty.', walking_time_minutes:2 },
  { id:'health_center', name:'Health Center', block:'A', floor:'1', room:'A106', category:'facilities', color:'#14b8a6', lat:11.0345, lng:77.0009, description:'Regular doctor visits and basic medical facilities.', walking_time_minutes:2 },
  { id:'restrooms', name:'Restrooms', block:'All Blocks', floor:'Every Floor', room:'Near Staircases', category:'facilities', color:'#14b8a6', lat:11.0340, lng:77.0012, description:'Clean restrooms on every floor of all academic blocks.', walking_time_minutes:1 },
  { id:'student_lounge', name:'Student Lounge', block:'D', floor:'1', room:'D101', category:'facilities', color:'#14b8a6', lat:11.0335, lng:77.0014, description:'Comfortable seating, magazines, vending machines.', walking_time_minutes:3 },
  // Innovation
  { id:'innovation_center', name:'Innovation Center', block:'A', floor:'2', room:'A212', category:'innovation', color:'#f59e0b', lat:11.0346, lng:77.0011, description:'Student startups, project incubation, mentorship support.', walking_time_minutes:2 },
  { id:'incubation_center', name:'Incubation Center', block:'B', floor:'3', room:'B310', category:'innovation', color:'#f59e0b', lat:11.0336, lng:77.0023, description:'Startup workspace, mentorship, resources for entrepreneurs.', walking_time_minutes:4 },
  // Entry/Exit
  { id:'main_gate', name:'Main Gate', block:'Front', floor:'Ground', room:'Entrance', category:'entry_exit', color:'#22c55e', lat:11.0353, lng:77.0010, description:'Main entrance gate with security check.', walking_time_minutes:0 },
  // Miscellaneous
  { id:'atm', name:'ATM', block:'A', floor:'Ground', room:'Near Reception', category:'miscellaneous', color:'#6b7280', lat:11.0341, lng:77.0007, description:'24/7 ATM facility near the reception area.', walking_time_minutes:1 },
  { id:'stationery_shop', name:'Stationery Shop', block:'D', floor:'Ground', room:'D002', category:'miscellaneous', color:'#6b7280', lat:11.0334, lng:77.0013, description:'Books, supplies, and printing services.', walking_time_minutes:3 },
];

const CATEGORIES = [
  { key: 'all', label: 'All', icon: Layers, color: '#6b7280' },
  { key: 'academic_blocks', label: 'Blocks', icon: Building2, color: '#3b82f6' },
  { key: 'departments', label: 'Depts', icon: BookOpen, color: '#8b5cf6' },
  { key: 'labs', label: 'Labs', icon: FlaskConical, color: '#10b981' },
  { key: 'library', label: 'Library', icon: BookOpen, color: '#f59e0b' },
  { key: 'cafeteria', label: 'Cafeteria', icon: Utensils, color: '#f97316' },
  { key: 'hostels', label: 'Hostels', icon: Home, color: '#64748b' },
  { key: 'transportation', label: 'Transport', icon: Bus, color: '#84cc16' },
  { key: 'administrative', label: 'Admin', icon: Shield, color: '#ef4444' },
  { key: 'facilities', label: 'Facilities', icon: Dumbbell, color: '#14b8a6' },
  { key: 'innovation', label: 'Innovation', icon: Lightbulb, color: '#f59e0b' },
  { key: 'entry_exit', label: 'Gates', icon: DoorOpen, color: '#22c55e' },
  { key: 'student_services', label: 'Services', icon: ChevronRight, color: '#a855f7' },
  { key: 'miscellaneous', label: 'Other', icon: MoreHorizontal, color: '#6b7280' },
];

export default function CampusMap() {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [mapReady, setMapReady] = useState(false);

  const filtered = ALL_LOCATIONS.filter((loc) => {
    const matchCat = activeCategory === 'all' || loc.category === activeCategory;
    const matchSearch = !search || loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.block.toLowerCase().includes(search.toLowerCase()) ||
      loc.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Init Leaflet map
  useEffect(() => {
    if (leafletMap.current || !mapRef.current) return;

    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current, {
        center: COLLEGE_CENTER,
        zoom: 17,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 20,
      }).addTo(map);

      leafletMap.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Update markers when filter/search changes
  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;

    import('leaflet').then((L) => {
      // Remove old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      filtered.forEach((loc) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:${loc.color};border:3px solid white;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
            cursor:pointer;
          "></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -34],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(leafletMap.current)
          .bindPopup(`
            <div style="min-width:180px;font-family:Inter,sans-serif">
              <div style="font-weight:700;font-size:13px;color:#1e293b;margin-bottom:4px">${loc.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">
                Block ${loc.block} · ${loc.floor}${loc.room ? ' · ' + loc.room : ''}
              </div>
              <div style="font-size:11px;color:#475569;line-height:1.5">${loc.description}</div>
              <div style="margin-top:6px;font-size:11px;color:#3b82f6;font-weight:600">
                🚶 ~${loc.walking_time_minutes} min walk
              </div>
            </div>
          `, { maxWidth: 240 });

        marker.on('click', () => setSelected(loc));
        markersRef.current.push(marker);
      });
    });
  }, [mapReady, filtered]);

  // Fly to selected location
  useEffect(() => {
    if (!selected || !leafletMap.current) return;
    leafletMap.current.flyTo([selected.lat, selected.lng], 19, { duration: 1 });
    // Open its popup
    markersRef.current.forEach((m) => {
      const ll = m.getLatLng();
      if (Math.abs(ll.lat - selected.lat) < 0.00001 && Math.abs(ll.lng - selected.lng) < 0.00001) {
        m.openPopup();
      }
    });
  }, [selected]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <PageHeader
        icon={Map}
        title="Campus Map"
        description="Interactive map of Sri Eshwar College of Engineering — click any marker to explore"
        gradient="from-emerald-600 via-teal-700 to-cyan-800"
      />

      {/* Search + Category filters */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveCategory('all'); }}
            placeholder="Search locations, blocks, departments..."
            className="input-field pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => { setActiveCategory(key); setSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                activeCategory === key
                  ? 'text-white border-transparent shadow-md'
                  : 'bg-white dark:bg-slate-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:border-gray-300'
              }`}
              style={activeCategory === key ? { background: color, borderColor: color } : {}}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Leaflet Map */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden" style={{ height: 520 }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-2xl">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Location list */}
        <div className="glass-card rounded-2xl p-4 flex flex-col" style={{ height: 520 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Locations
              <span className="badge bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 text-[10px]">
                {filtered.length}
              </span>
            </h3>
            {selected && (
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No locations found.</p>
              </div>
            ) : (
              filtered.map((loc) => (
                <motion.button
                  key={loc.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
                  className={`w-full p-3 rounded-xl text-left border transition-all duration-150 ${
                    selected?.id === loc.id
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10 shadow-sm'
                      : 'border-gray-100 dark:border-white/[0.05] bg-white/50 dark:bg-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: loc.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{loc.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">
                        Block {loc.block} · {loc.floor}
                        {loc.room && loc.room !== 'Open Area' && loc.room !== 'Entrance' ? ` · ${loc.room}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] text-gray-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      {loc.walking_time_minutes}m
                    </div>
                  </div>

                  <AnimatePresence>
                    {selected?.id === loc.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]"
                      >
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{loc.description}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-primary-600 dark:text-primary-400 font-medium">
                          <Navigation className="w-3 h-3" />
                          Marker highlighted on map
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary-500" /><strong className="text-gray-900 dark:text-white">{ALL_LOCATIONS.length}</strong> total locations</span>
          <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-secondary-500" /><strong className="text-gray-900 dark:text-white">{CATEGORIES.length - 1}</strong> categories</span>
          <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-emerald-500" />Sri Eshwar College of Engineering, Coimbatore</span>
          <span className="ml-auto text-[10px]">Click any marker or list item to explore · Scroll to zoom</span>
        </div>
      </div>
    </motion.div>
  );
}
