// components/SummaryStats.tsx
'use client';

interface Task {
  statusId: number;
  durationMinutes: number;
}

interface SummaryStatsProps {
  tasks: Task[];
}

export default function SummaryStats({ tasks }: SummaryStatsProps) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.statusId === 3).length,
    pending: tasks.filter((t) => t.statusId === 2).length,
    todo: tasks.filter((t) => t.statusId === 1).length,
    onHold: tasks.filter((t) => t.statusId === 4).length,
    totalMinutes: tasks.reduce((sum, t) => sum + t.durationMinutes, 0),
  };

  const totalHours = Math.floor(stats.totalMinutes / 60);
  const remainingMinutes = stats.totalMinutes % 60;

  const completionRate =
    stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Tasks */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="text-sm font-medium text-slate-600">Total Tasks</div>
        <div className="text-3xl font-bold text-slate-800 mt-1">
          {stats.total}
        </div>
      </div>

      {/* Completed */}
      <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
        <div className="text-sm font-medium text-green-700">Completed</div>
        <div className="text-3xl font-bold text-green-800 mt-1">
          {stats.completed}
        </div>
        <div className="text-xs text-green-600 mt-1">
          {completionRate}% completion rate
        </div>
      </div>

      {/* Pending */}
      <div className="bg-amber-50 rounded-lg p-4 shadow-sm border border-amber-200">
        <div className="text-sm font-medium text-amber-700">Pending</div>
        <div className="text-3xl font-bold text-amber-800 mt-1">
          {stats.pending}
        </div>
      </div>

      {/* To Do */}
      <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
        <div className="text-sm font-medium text-purple-700">To Do</div>
        <div className="text-3xl font-bold text-purple-800 mt-1">
          {stats.todo}
        </div>
      </div>

      {/* On Hold */}
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
        <div className="text-sm font-medium text-blue-700">On Hold</div>
        <div className="text-3xl font-bold text-blue-800 mt-1">
          {stats.onHold}
        </div>
      </div>

      {/* Total Hours */}
      <div className="bg-sky-50 rounded-lg p-4 shadow-sm border border-sky-200">
        <div className="text-sm font-medium text-sky-700">Total Hours</div>
        <div className="text-3xl font-bold text-sky-800 mt-1">
          {totalHours}h
        </div>
        {remainingMinutes > 0 && (
          <div className="text-xs text-sky-600 mt-1">{remainingMinutes}m</div>
        )}
      </div>
    </div>
  );
}