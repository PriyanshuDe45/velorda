import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const WEATHER_OPTIONS = ['Clear', 'Fog', 'Rain', 'Snow'];

export default function RentConditionsPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    weatherEnabled: false,
    weather: [],
    ratingEnabled: false,
    minRating: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/categories/${categoryId}/conditions`)
      .then(res => {
        const c = res.data;
        setForm({
          weatherEnabled: c.weatherEnabled || false,
          weather: c.weather || [],
          ratingEnabled: c.ratingEnabled || false,
          minRating: c.minRating || '',
        });
      })
      .catch(() => {});
  }, [categoryId]);

  const toggleWeather = (w) => {
    setForm(f => ({
      ...f,
      weather: f.weather.includes(w) ? f.weather.filter(x => x !== w) : [...f.weather, w],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`/api/categories/${categoryId}/conditions`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/categories')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Rent Conditions</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}
      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">Saved!</div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={form.weatherEnabled}
              onChange={e => setForm({ ...form, weatherEnabled: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium text-sm text-gray-900">Weather condition</span>
          </label>
          {form.weatherEnabled && (
            <div className="flex gap-2 flex-wrap ml-6">
              {WEATHER_OPTIONS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWeather(w)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    form.weather.includes(w)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={form.ratingEnabled}
              onChange={e => setForm({ ...form, ratingEnabled: e.target.checked })}
              className="rounded"
            />
            <span className="font-medium text-sm text-gray-900">Minimum user rating</span>
          </label>
          {form.ratingEnabled && (
            <input
              type="number"
              step="0.01"
              min="0"
              max="5"
              placeholder="e.g. 4.70"
              value={form.minRating}
              onChange={e => setForm({ ...form, minRating: e.target.value })}
              className="ml-6 w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          Save Conditions
        </button>
      </form>
    </div>
  );
}