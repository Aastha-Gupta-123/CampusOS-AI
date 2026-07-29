import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import NavigationAgent from './pages/NavigationAgent';
import HostelAgent from './pages/HostelAgent';
import ComplaintTracker from './pages/ComplaintTracker';
import CampusMap from './pages/CampusMap';
import About from './pages/About';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('campusmate-theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('campusmate-language') || 'en');

  useEffect(() => { localStorage.setItem('campusmate-theme', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('campusmate-language', language); }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === 'dark') root.classList.add('dark');
    else if (darkMode === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0f1e] bg-mesh dark:bg-mesh-dark">
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            background: darkMode === 'dark' ? '#1e293b' : '#fff',
            color: darkMode === 'dark' ? '#f1f5f9' : '#1e293b',
            border: darkMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          },
        }}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(darkMode === 'dark' ? 'light' : 'dark')}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/"           element={<Dashboard />} />
              <Route path="/navigation" element={<NavigationAgent />} />
              <Route path="/hostel"     element={<HostelAgent />} />
              <Route path="/tracker"    element={<ComplaintTracker />} />
              <Route path="/map"        element={<CampusMap />} />
              <Route path="/about"      element={<About />} />
              <Route path="/settings"   element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} language={language} setLanguage={setLanguage} />} />
              <Route path="*"           element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
