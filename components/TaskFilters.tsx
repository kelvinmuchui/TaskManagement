// components/TaskFilters.tsx
'use client';

import { categoryMap, statusNames } from '@/lib/categories';

interface TaskFiltersProps {
  dateRange: 'daily' | 'weekly' | 'monthly';
  specificDate: string;
  category: string;
  status: string;
  onDateRangeChange: (range: 'daily' | 'weekly' | 'monthly') => void;
  onSpecificDateChange: (date: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  onExport: () => void;
}

export default function TaskFilters({
  dateRange,
  specificDate,
  category,
  status,
  onDateRangeChange,
  onSpecificDateChange,
  onCategoryChange,
  onStatusChange,
  onClearFilters,
  onExport,
}: TaskFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-slate-200">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left side - Filters */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) =>
                onDateRangeChange(e.target.value as 'daily' | 'weekly' | 'monthly')
              }
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Specific Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Specific Date
            </label>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => onSpecificDateChange(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Categories</option>
              {Object.keys(categoryMap).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Status</option>
              {statusNames.map((name, idx) => (
                <option key={idx + 1} value={String(idx + 1)}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="flex lg:flex-col gap-2 lg:justify-center">
          <button
            onClick={onClearFilters}
            className="flex-1 lg:flex-none border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={onExport}
            className="flex-1 lg:flex-none bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium shadow-sm transition-colors"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(specificDate || category || status) && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600">
              Active filters:
            </span>
            {specificDate && (
              <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
                Date: {specificDate}
                <button
                  onClick={() => onSpecificDateChange('')}
                  className="hover:text-sky-900"
                >
                  ✕
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Category: {category}
                <button
                  onClick={() => onCategoryChange('')}
                  className="hover:text-purple-900"
                >
                  ✕
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                Status: {statusNames[parseInt(status) - 1]}
                <button
                  onClick={() => onStatusChange('')}
                  className="hover:text-amber-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}