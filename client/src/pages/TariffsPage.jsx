import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function TariffsPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [tariffs, setTariffs] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'STATIC', basePrice: '', minPrice: '', maxPrice: '',
  });

  const fetchTariffs = async () => {
    const res = await api.get(`/api/tariffs?categoryId=${categoryId}`);
    setTariffs(res.data);
  };

  useEffect(() => { fetchTariffs(); }, [categoryId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/tariffs', { ...form, categoryId });
      setForm({ name: '', type: 'STATIC', basePrice: '', minPrice: '', maxPrice: '' });
      setShowForm(false);
      fetchTariffs();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleArchive = async (id) => {
    try {
      await api.patch(`/api/tariffs/${id}/archive`);
      fetchTariffs();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/tariffs/${id}`);
      fetchTariffs();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/categories')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Tariffs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Add Tariff
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-medium text-gray-900">New Tariff</h2>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STATIC">Fixed (Static)</option>
              <option value="DYNAMIC">Dynamic</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Price per minute (tenge)</label>
            <input
              type="number"
              step="0.01"
              placeholder="Base price"
              value={form.basePrice}
              onChange={e => setForm({ ...form, basePrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {form.type === 'DYNAMIC' && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Min price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.minPrice}
                  onChange={e => setForm({ ...form, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Max price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.maxPrice}
                  onChange={e => setForm({ ...form, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tariffs.map(tariff => (
          <div
            key={tariff._id}
            className={`border rounded-lg p-4 flex items-center gap-3 ${
              tariff.isArchived ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900">{tariff.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tariff.type === 'STATIC' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {tariff.type === 'STATIC' ? 'Fixed' : 'Dynamic'}
                </span>
                {tariff.isArchived && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Archived</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {tariff.basePrice} rupee/min
                {tariff.type === 'DYNAMIC' && ` · min: ${tariff.minPrice} · max: ${tariff.maxPrice}`}
              </p>
            </div>
            <button
              onClick={() => handleArchive(tariff._id)}
              className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100"
            >
              {tariff.isArchived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              onClick={() => handleDelete(tariff._id)}
              className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}