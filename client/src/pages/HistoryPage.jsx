import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HistoryPage() {
  const [data, setData] = useState({ bookings: [], total: 0, pages: 1, page: 1 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: p });
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await api.get(`/api/bookings?${params}`);
      setData(res.data);
      setPage(p);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setTimeout(() => fetchHistory(1), 0);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const isProduction = window.location.pathname.startsWith('/velorda');
    const base = isProduction ? '/velorda' : '';
    window.open(`${base}/api/bookings/export?${params}`, '_blank');
  };

  const getPaginationPages = (current, total) => {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (current > 2) pages.push(1, '...');
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) pages.push(i);
    if (current < total - 1) pages.push('...', total);
    return pages;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '—';

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  }) : '';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.total} total record{data.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <form onSubmit={handleFilter} className="flex flex-wrap gap-3 mb-6 bg-white border border-gray-200 rounded-xl p-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Filter
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Renter</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">End</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Wear</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-gray-300 text-4xl mb-3">📋</div>
                    <p className="text-gray-400 text-sm">No rental records found</p>
                  </td>
                </tr>
              ) : (
                data.bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{b.renter?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{b.renter?.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{formatDate(b.startedAt)}</div>
                      <div className="text-gray-400 text-xs">{formatTime(b.startedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{formatDate(b.endedAt)}</div>
                      <div className="text-gray-400 text-xs">{formatTime(b.endedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.percentageOfWear > 70 ? 'bg-red-500' :
                              b.percentageOfWear > 40 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${b.percentageOfWear}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{b.percentageOfWear}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{b.finalPrice?.toLocaleString()} </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">
                            {'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)}
                          </span>
                          <span className="text-xs text-gray-400">{b.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">No rating</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {page} of {data.pages} · {data.total} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </button>
            {getPaginationPages(page, data.pages).map((p, i) => (
              p === '...'
                ? <span key={i} className="px-2 text-gray-400 text-sm">...</span>
                : <button
                    key={i}
                    onClick={() => fetchHistory(p)}
                    className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
            ))}
            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page === data.pages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}