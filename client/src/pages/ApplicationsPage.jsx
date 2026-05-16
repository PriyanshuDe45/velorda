import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await api.get('/api/applications');
      setApplications(res.data);
    } catch (err) {
      setError('Failed to load applications');
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleStatus = async (id, status) => {
    setError('');
    try {
      await api.patch(`/api/applications/${id}`, { status });
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending:  'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applications</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <div className="space-y-3">
        {applications.length === 0 && (
          <div className="text-center text-gray-400 py-12">No applications yet</div>
        )}
        {applications.map(app => (
          <div key={app._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{app.applicantName}</span>
                  {statusBadge(app.status)}
                  {app.category && (
                    <span className="text-xs text-gray-400">→ {app.category.name}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{app.applicantEmail}</p>
                <p className="text-sm text-gray-500">{app.applicantPhone}</p>
              </div>
              {app.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatus(app._id, 'approved')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(app._id, 'rejected')}
                    className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}