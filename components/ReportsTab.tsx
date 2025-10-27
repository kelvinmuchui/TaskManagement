// components/ReportsTab.tsx
'use client';

import { useState } from 'react';
import BarChartComponent from './charts/BarChart';
import PieChartComponent from './charts/PieChart';
import LineChartComponent from './charts/LineChart';
import { exportReportWithChartsToPDF } from '@/lib/utils/reportExport';

interface Task {
  _id: string;
  userId: string;
  date: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  statusId: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface ReportsTabProps {
  tasks: Task[];
}

export default function ReportsTab({ tasks }: ReportsTabProps) {
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 10));

  // Filter tasks based on report range
  const getFilteredTasks = () => {
    const base = new Date(baseDate);
    let startDate: Date;
    let endDate: Date;

    if (reportRange === 'daily') {
      startDate = new Date(base);
      endDate = new Date(base);
    } else if (reportRange === 'weekly') {
      const dayOfWeek = base.getDay();
      startDate = new Date(base);
      startDate.setDate(base.getDate() - dayOfWeek);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      startDate = new Date(base.getFullYear(), base.getMonth(), 1);
      endDate = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    }

    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    return tasks.filter((task) => task.date >= startStr && task.date <= endStr);
  };

  const filteredTasks = getFilteredTasks();

  // Calculate summary statistics
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter((t) => t.statusId === 3).length,
    pending: filteredTasks.filter((t) => t.statusId === 2).length,
    todo: filteredTasks.filter((t) => t.statusId === 1).length,
    onHold: filteredTasks.filter((t) => t.statusId === 4).length,
    totalMinutes: filteredTasks.reduce((sum, t) => sum + t.durationMinutes, 0),
  };

  const totalHours = Math.floor(stats.totalMinutes / 60);
  const remainingMinutes = stats.totalMinutes % 60;
  const completionRate =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  const handleExportPDF = async () => {
    try {
      await exportReportWithChartsToPDF(
        filteredTasks,
        reportRange,
        baseDate,
        stats
      );
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Report Type
              </label>
              <select
                value={reportRange}
                onChange={(e) =>
                  setReportRange(e.target.value as 'daily' | 'weekly' | 'monthly')
                }
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Base Date
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium shadow-sm"
            >
              📄 Export Report PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
          <div className="text-sm font-medium text-slate-600">Total Tasks</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
          <div className="text-sm font-medium text-green-700">Completed</div>
          <div className="text-3xl font-bold text-green-800 mt-1">
            {stats.completed}
          </div>
          <div className="text-xs text-green-600 mt-1">{completionRate}%</div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4 shadow-sm border border-amber-200">
          <div className="text-sm font-medium text-amber-700">Pending</div>
          <div className="text-3xl font-bold text-amber-800 mt-1">{stats.pending}</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
          <div className="text-sm font-medium text-purple-700">To Do</div>
          <div className="text-3xl font-bold text-purple-800 mt-1">{stats.todo}</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
          <div className="text-sm font-medium text-blue-700">On Hold</div>
          <div className="text-3xl font-bold text-blue-800 mt-1">{stats.onHold}</div>
        </div>

        <div className="bg-sky-50 rounded-lg p-4 shadow-sm border border-sky-200">
          <div className="text-sm font-medium text-sky-700">Total Time</div>
          <div className="text-3xl font-bold text-sky-800 mt-1">{totalHours}h</div>
          {remainingMinutes > 0 && (
            <div className="text-xs text-sky-600 mt-1">{remainingMinutes}m</div>
          )}
        </div>
      </div>

      {/* Charts */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <BarChartComponent tasks={filteredTasks} />
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <PieChartComponent tasks={filteredTasks} />
          </div>

          {/* Line Chart - Full Width */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <LineChartComponent tasks={filteredTasks} dateRange={reportRange} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-slate-200">
          <div className="text-slate-500 text-lg">
            No tasks found for the selected date range.
          </div>
          <div className="text-slate-400 text-sm mt-2">
            Try selecting a different date or report type.
          </div>
        </div>
      )}
    </div>
  );
}