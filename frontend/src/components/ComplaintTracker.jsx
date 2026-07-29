import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

function ComplaintTracker() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadComplaints = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/complaints`);
        const data = response.data;
        setComplaints(data.complaints || data || []);
      } catch (err) {
        setError('Unable to load complaints.');
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Complaint Tracker</h2>
        <span className="rounded-full bg-cyan-600/20 px-3 py-1 text-sm text-cyan-300">
          {complaints.length} active
        </span>
      </div>

      {loading && <p className="mt-4 text-slate-400">Loading complaints...</p>}
      {error && <p className="mt-4 text-rose-400">{error}</p>}

      <div className="mt-4 space-y-3">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{complaint.student_name}</p>
                <p className="text-sm text-slate-400">Room {complaint.room_number}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-cyan-300">{complaint.category}</p>
                <p className="text-amber-300">{complaint.priority}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">{complaint.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>ID: {complaint.complaint_id}</span>
              <span>Status: {complaint.status}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ComplaintTracker;
