// components/AddEmployeeModal.tsx
'use client';

import { useState } from 'react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          isAdmin: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add employee');
        return;
      }

      // Success
      setFormData({ username: '', password: '', confirmPassword: '' });
      onSuccess();
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ username: '', password: '', confirmPassword: '' });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Add Employee</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700 text-2xl disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={loading}
              placeholder="Enter username"
              minLength={3}
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum 3 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={loading}
              placeholder="Enter password"
              minLength={4}
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum 4 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={loading}
              placeholder="Confirm password"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <strong>Note:</strong> The new employee will be able to log in with these credentials and manage their own tasks.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-slate-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}