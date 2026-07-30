import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getLocations } from '../services/api';

export default function CampusMap() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getLocations()
      .then((data) => setLocations(data.locations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter((loc) =>
    loc.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <PageHeader
        icon={Map}
        title="Campus Map"
        description="Interactive campus location map - find buildings, departments, and facilities"
        gradient="from-emerald-600 via-teal-700 to-cyan-800"
      />

      {/* Search */}
      <div className="glass-card rounded-2xl p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campus locations..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-10 text-center min-h-[400px] flex flex-col items-center justify-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl mb-5"
          >
            <MapPin className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Campus Map</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            The interactive map view is being enhanced. In the meantime, use the search below to find campus locations and get directions.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Navigation className="w-4 h-4" />
            <span>Sri Eshwar College of Engineering, Coimbatore</span>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          Campus Locations {!loading && <span className="badge bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400">{filtered.length}</span>}
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No locations found.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc) => (
              <motion.button
                key={loc.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 ${
                  selected?.id === loc.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-md'
                    : 'border-gray-100 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] hover:border-primary-200 dark:hover:border-primary-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selected?.id === loc.id ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{loc.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Block {loc.block} · {loc.floor}
                      {loc.room ? ` · ${loc.room}` : ''}
                    </p>
                    {selected?.id === loc.id && loc.description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.06]"
                      >
                        {loc.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}