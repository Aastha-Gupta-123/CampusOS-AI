import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

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
