// components/TaskModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { categoryMap, statusNames } from '@/lib/categories';

interface Task {
  _id?: string;
  date: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  statusId: number;
  startTime: string;
  endTime: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, '_id'>) => Promise<void>;
  task?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, task }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Task, '_id'>>({
    date: new Date().toISOString().slice(0, 10),
    category: '',
    subcategory: '',
    title: '',
    description: '',
    statusId: 1,
    startTime: '09:00',
    endTime: '10:00',
  });

  const [subcategories, setSubcategories] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setFormData({
        date: task.date,
        category: task.category,
        subcategory: task.subcategory,
        title: task.title,
        description: task.description,
        statusId: task.statusId,
        startTime: task.startTime,
        endTime: task.endTime,
      });
      setSubcategories(categoryMap[task.category] || []);
    } else {
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        category: '',
        subcategory: '',
        title: '',
        description: '',
        statusId: 1,
        startTime: '09:00',
        endTime: '10:00',
      });
      setSubcategories([]);
    }
  }, [task, isOpen]);

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category, subcategory: '' });
    setSubcategories(categoryMap[category] || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">
            {task ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
                disabled={loading}
              >
                <option value="">Select category</option>
                {Object.keys(categoryMap).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
                disabled={loading || !formData.category}
              >
                <option value="">Select subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
              disabled={loading}
              placeholder="Enter task title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              rows={3}
              disabled={loading}
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Status
              </label>
              <select
                value={formData.statusId}
                onChange={(e) => setFormData({ ...formData, statusId: parseInt(e.target.value) })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled={loading}
              >
                {statusNames.map((status, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-slate-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}