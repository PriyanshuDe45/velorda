import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function HistoryPage() {
  const [data, setData] = useState({ bookings: [], total: 0, pages: 1, page: 1 });
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');

  const fetchHistory = async (p = 1) => {
    try {
      const params = new URLSearchParams({ page: p });
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      const res = await api.get(`/api/bookings?${params}`);
      setData(res.data);
      setPage(p);
    } catch (err) {
      setError('Failed to load history');
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    window.open(`/api/bookings/export?${params}`, '_blank');
  };

  const getPaginationPages = (current, total) => {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    if (current > 2) pages.push(1, '...');
    for (let i = Math.max(1, current - 1); i <= Math.min(total, current + 1); i++) pages.push(i);
    if (current < total - 1) pages.push('...', total);
    return pages;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Rental History</h1>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      <form onSubmit={handleFilter} className="flex gap-3 mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            Filter
          </button>
          <button
            type="button"
            onClick={() => { setFrom(''); setTo(''); setTimeout(() => fetchHistory(1), 0); }}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Renter</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Phone</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Start</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">End</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Wear %</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Price</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found</td>
              </tr>
            )}
            {data.bookings.map(b => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.renter?.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.renter?.phone}</td>
                <td className="px-4 py-3 text-gray-500">
                  {b.startedAt ? new Date(b.startedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {b.endedAt ? new Date(b.endedAt).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500">{b.percentageOfWear}%</td>
                <td className="px-4 py-3">
                 
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{b.finalPrice} </td>
                <td className="px-4 py-3">
                  {b.rating ? (
                    <span className="text-yellow-500">{'★'.repeat(b.rating)}{'☆'.repeat(5 - b.rating)}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => fetchHistory(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>

          {getPaginationPages(page, data.pages).map((p, i) => (
            p === '...'
              ? <span key={i} className="px-2 text-gray-400">...</span>
              : <button
                  key={i}
                  onClick={() => fetchHistory(p)}
                  className={`px-3 py-1 text-sm border rounded-lg ${
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
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}