import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function PromoCodesPage() {
  const [promos, setPromos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    categoryId: '',
    expiresAt: '',
    type: 'discount',
    freeMinutes: '',
    discountPercent: '',
  });

  const fetchPromos = async () => {
    const res = await api.get('/api/promocodes');
    setPromos(res.data);
  };

  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    setCategories(res.data);
  };

  useEffect(() => {
    fetchPromos();
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        categoryId: form.categoryId,
        expiresAt: form.expiresAt,
        freeMinutes: form.type === 'free' ? form.freeMinutes : null,
        discountPercent: form.type === 'discount' ? form.discountPercent : null,
      };
      await api.post('/api/promocodes', payload);
      setForm({ categoryId: '', expiresAt: '', type: 'discount', freeMinutes: '', discountPercent: '' });
      setShowForm(false);
      fetchPromos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/api/promocodes/${id}`);
      fetchPromos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Promo Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Generate Code
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-medium text-gray-900">New Promo Code</h2>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Expires At</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Discount Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="discount">Discount %</option>
              <option value="free">Free Minutes</option>
            </select>
          </div>
          {form.type === 'discount' && (
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="Discount percent e.g. 20"
              value={form.discountPercent}
              onChange={e => setForm({ ...form, discountPercent: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          {form.type === 'free' && (
            <input
              type="number"
              min="1"
              placeholder="Free minutes e.g. 30"
              value={form.freeMinutes}
              onChange={e => setForm({ ...form, freeMinutes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Generate
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {promos.length === 0 && (
          <div className="text-center text-gray-400 py-12">No promo codes yet</div>
        )}
        {promos.map(promo => (
          <div key={promo._id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-gray-900 text-lg tracking-widest">{promo.code}</span>
                {promo.category && (
                  <span className="text-xs text-gray-400">{promo.category.name}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                {promo.discountPercent && ` · ${promo.discountPercent}% discount`}
                {promo.freeMinutes && ` · ${promo.freeMinutes} free minutes`}
              </p>
            </div>
            <button
              onClick={() => handleDelete(promo._id)}
              className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}