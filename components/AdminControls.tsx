// components/AdminControls.tsx
'use client';

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
}

interface AdminControlsProps {
  users: User[];
  viewMode: 'self' | 'user' | 'all';
  selectedUser: string | null;
  onViewModeChange: (mode: 'self' | 'user' | 'all', username?: string) => void;
  onAddEmployee: () => void;
}

export default function AdminControls({
  users,
  viewMode,
  selectedUser,
  onViewModeChange,
  onAddEmployee,
}: AdminControlsProps) {
  const handleSelectChange = (value: string) => {
    if (value === 'self') {
      onViewModeChange('self');
    } else if (value === 'all') {
      onViewModeChange('all');
    } else {
      onViewModeChange('user', value);
    }
  };

  const getCurrentValue = () => {
    if (viewMode === 'self') return 'self';
    if (viewMode === 'all') return 'all';
    return selectedUser || 'self';
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-200">
      <label className="text-sm font-medium text-slate-700">
        View:
      </label>
      
      <select
        value={getCurrentValue()}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="border border-slate-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
      >
        <option value="self">My Tasks</option>
        <option value="all">All Users</option>
        <optgroup label="Specific Users">
          {users
            .filter((u) => !u.isAdmin) // Don't show admin in the list
            .map((user) => (
              <option key={user._id} value={user.username}>
                {user.username}
              </option>
            ))}
        </optgroup>
      </select>

      <div className="flex-1"></div>

      <button
        onClick={onAddEmployee}
        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium shadow-sm"
      >
        + Add Employee
      </button>

      {/* View Mode Indicator */}
      <div className="text-sm text-slate-600 bg-sky-50 px-3 py-2 rounded-md border border-sky-200">
        {viewMode === 'self' && '👤 Viewing: My Tasks'}
        {viewMode === 'all' && '👥 Viewing: All Users'}
        {viewMode === 'user' && `👤 Viewing: ${selectedUser}'s Tasks`}
      </div>
    </div>
  );
}