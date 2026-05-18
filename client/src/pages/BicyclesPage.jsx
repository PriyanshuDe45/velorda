import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BicyclesPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBike, setEditBike] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', copies: 1 });
  const [dragOver, setDragOver] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const fetch = async () => {
    const res = await api.get(`/api/bicycles?categoryId=${categoryId}`);
    setBikes(res.data);
  };

  useEffect(() => { fetch(); }, [categoryId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/bicycles', { ...form, categoryId });
      setForm({ name: '', description: '', copies: 1 });
      setShowForm(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.patch(`/api/bicycles/${editBike._id}`, {
        name: editBike.name,
        description: editBike.description,
        wear: editBike.wear,
      });
      setEditBike(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleStatusToggle = async (bike) => {
    setError('');
    const newStatus = bike.status === 'available' ? 'unavailable' : 'available';
    try {
      await api.patch(`/api/bicycles/${bike._id}`, { status: newStatus });
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/api/bicycles/${id}`);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    }
  };

  const handleDrop = async (e, bikeId) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await api.post(`/api/bicycles/${bikeId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetch();
    } catch (err) {
      setError('Image upload failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/categories')} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Bicycles</h1>
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          + Add Bicycle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-medium text-gray-900">New Bicycle</h2>
          <input
            type="text"
            placeholder="Name (max 100 chars)"
            maxLength={100}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Copies (quantity)</label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.copies}
              onChange={e => setForm({ ...form, copies: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              Create
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      {showMap && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
          <div className="relative w-full h-full overflow-auto bg-green-50">
            <div style={{ width: '5000px', height: '5000px', position: 'relative' }}>
              {bikes.map(bike => (
                <div
                  key={bike._id}
                  style={{
                    position: 'absolute',
                    left: bike.locationX - 25,
                    top: bike.locationY - 25,
                    width: 50,
                    height: 50,
                  }}
                  title={bike.name}
                >
                  {bike.image ? (
                    <img
                      src={`/uploads/${bike.image}`}
                      alt={bike.name}
                      className="w-full h-full object-cover rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      🚲
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editBike && (
        <form onSubmit={handleEdit} className="bg-white border border-blue-200 rounded-lg p-4 mb-6 space-y-3">
          <h2 className="font-medium text-gray-900">Edit Bicycle</h2>
          <input
            type="text"
            maxLength={100}
            value={editBike.name}
            onChange={e => setEditBike({ ...editBike, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            value={editBike.description}
            onChange={e => setEditBike({ ...editBike, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Wear %</label>
            <input
              type="number"
              min={0}
              max={100}
              value={editBike.wear}
              onChange={e => setEditBike({ ...editBike, wear: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
              Save
            </button>
            <button type="button" onClick={() => setEditBike(null)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {bikes.map(bike => (
          <div key={bike._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                  dragOver === bike._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(bike._id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, bike._id)}
              >
                {bike.image ? (
                  <img src={`/velorda/uploads/${bike.image}`} alt={bike.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">🚲</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{bike.name}</span>
                  <span className="text-xs text-gray-400">/{bike.slug}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    bike.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {bike.status}
                  </span>
                </div>
                {bike.description && <p className="text-sm text-gray-500 mb-1">{bike.description}</p>}
                <p className="text-xs text-gray-400">Wear: {bike.wear}%</p>
                <p className="text-xs text-gray-300 mt-1">Drop image above to upload</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleStatusToggle(bike)}
                  className={`px-3 py-1 text-xs rounded-lg ${
                    bike.status === 'available'
                      ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {bike.status === 'available' ? 'Set Unavailable' : 'Set Available'}
                </button>
                <button
                  onClick={() => setEditBike(bike)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(bike._id)}
                  className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}