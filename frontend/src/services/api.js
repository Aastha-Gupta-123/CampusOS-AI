import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusmate-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally - clear stale token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('campusmate-token');
    }
    return Promise.reject(err);
  }
);

// ── Auth API ────────────────────────────────────────────────────────
export const register = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
};

export const login = async (emailOrRegister, password) => {
  const response = await api.post('/auth/login', {
    email_or_register: emailOrRegister,
    password,
  });
  return response.data;
};

export const logout = async (token) => {
  const response = await api.post('/auth/logout', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getProfile = async (token) => {
  const response = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProfile = async (token, data) => {
  const response = await api.put('/auth/profile', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ── Master Orchestrator ──────────────────────────────────────────
export const orchestratorChat = async (question) => {
  const response = await api.get('/chat', { params: { question } });
  return response.data;
};

export const getOrchestratorStatus = async () => {
  const response = await api.get('/orchestrator/status');
  return response.data;
};

// ── Navigation ────────────────────────────────────────────────
export const navigationChat = async (question) => {
  const response = await api.get('/chat/navigation', { params: { question } });
  return response.data;
};

export const getNavigation = async (place) => {
  const response = await api.get('/navigate', { params: { place } });
  return response.data;
};

// ── Hostel / Complaints ───────────────────────────────────────
export const hostelChat = async (question) => {
  const response = await api.get('/chat/hostel', { params: { question } });
  return response.data;
};

export const submitComplaint = async (studentName, roomNumber, description) => {
  const response = await api.post('/complaint', {
    student_name: studentName,
    room_number: roomNumber,
    description,
  });
  return response.data;
};

export const getComplaintById = async (complaintId) => {
  const response = await api.get(`/complaints/${complaintId}`);
  return response.data;
};

export const listComplaints = async () => {
  const response = await api.get('/complaints');
  return response.data;
};

export const updateComplaintStatus = async (complaintId, status) => {
  const response = await api.post(`/complaint/${complaintId}/status`, { status });
  return response.data;
};

// ── Attendance ─────────────────────────────────────────────────
export const attendanceChat = async (question) => {
  const response = await api.get('/chat/attendance', { params: { question } });
  return response.data;
};

export const getAttendanceSummary = async () => {
  const response = await api.get('/attendance/summary');
  return response.data;
};

// ── Timetable ──────────────────────────────────────────────────
export const timetableChat = async (question) => {
  const response = await api.get('/chat/timetable', { params: { question } });
  return response.data;
};

export const getTimetableSummary = async () => {
  const response = await api.get('/timetable/summary');
  return response.data;
};

// ── Placement ──────────────────────────────────────────────────
export const generatePlacementPlan = async (formData) => {
  const response = await api.post('/chat/placement', formData);
  return response.data;
};

// ── Learning Coach ─────────────────────────────────────────────
export const generateStudyPlan = async (formData) => {
  const response = await api.post('/chat/learning', formData);
  return response.data;
};

export const campusOSChat = async (payload) => {
  const response = await api.post('/chat/campusos', payload);
  return response.data;
};

// ── Dashboard & System ────────────────────────────────────────
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await api.get('/system/health');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// ── Locations ─────────────────────────────────────────────────
export const getLocations = async () => {
  const response = await api.get('/locations');
  return response.data;
};

export default api;