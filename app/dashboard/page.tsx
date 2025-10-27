// app/dashboard/page.tsx - UPDATED VERSION with Advanced Filters
'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import TaskModal from '@/components/TaskModal';
import KanbanBoard from '@/components/KanbanBoard';
import TabNavigation from '@/components/TabNavigation';
import AdminControls from '@/components/AdminControls';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import TaskFilters from '@/components/TaskFilters';
import SummaryStats from '@/components/SummaryStats';
import { statusNames, statusColors } from '@/lib/categories';
import WeeklyPlanner from '@/components/WeeklyPlanner';
import ReportsTab from '@/components/ReportsTab';
import { exportTasksToPDF, getDateRange } from '@/lib/utils/export';

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

interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
}

const TABS = [
  { id: 'kanban', label: 'Kanban Board', icon: '📋' },
  { id: 'table', label: 'All Tasks', icon: '📊' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'weekly', label: 'Weekly Planner', icon: '📅' },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusCounts, setStatusCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [activeTab, setActiveTab] = useState('kanban');
  const [kanbanDate, setKanbanDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Admin view state
  const [viewMode, setViewMode] = useState<'self' | 'user' | 'all'>('self');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Filter state
  const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [specificDate, setSpecificDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const username = (session?.user as any)?.username || 'User';
  const isAdmin = (session?.user as any)?.isAdmin || false;

  useEffect(() => {
    loadTasks();
    if (isAdmin) {
      loadUsers();
    }
  }, [viewMode, selectedUser]);

  useEffect(() => {
    applyFilters();
  }, [allTasks, dateRange, specificDate, categoryFilter, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      let url = '/api/tasks?viewMode=' + viewMode;
      if (viewMode === 'user' && selectedUser) {
        url += '&viewUser=' + selectedUser;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setAllTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTasks];

    // Apply date filter
    if (specificDate) {
      filtered = filtered.filter((task) => task.date === specificDate);
    } else {
      const { startDate, endDate } = getDateRange(dateRange);
      filtered = filtered.filter(
        (task) => task.date >= startDate && task.date <= endDate
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((task) => task.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((task) => String(task.statusId) === statusFilter);
    }

    setFilteredTasks(filtered);
    calculateStatusCounts(filtered);
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const calculateStatusCounts = (taskList: Task[]) => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    taskList.forEach(task => {
      counts[task.statusId as keyof typeof counts]++;
    });
    setStatusCounts(counts);
  };

  const handleViewModeChange = (mode: 'self' | 'user' | 'all', user?: string) => {
    setViewMode(mode);
    setSelectedUser(user || null);
  };

  const handleCreateTask = async (taskData: Omit<Task, '_id'>) => {
    try {
      let userId = username;
      if (isAdmin && viewMode === 'user' && selectedUser) {
        userId = selectedUser;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, userId }),
      });

      if (response.ok) {
        await loadTasks();
        setIsModalOpen(false);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, '_id'>) => {
    if (!editingTask?._id) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        await loadTasks();
        setEditingTask(null);
        setIsModalOpen(false);
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatusId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusId: newStatusId }),
      });

      if (response.ok) {
        await loadTasks();
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const handleTaskDateChange = async (taskId: string, newDate: string) => {
    if (!newDate) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate }),
      });

      if (response.ok) {
        await loadTasks();
      } else {
        throw new Error('Failed to update task date');
      }
    } catch (error) {
      console.error('Error updating task date:', error);
      alert('Failed to update task date');
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleNewTaskClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleEmployeeAdded = () => {
    loadUsers();
    alert('Employee added successfully!');
  };

  const handleClearFilters = () => {
    setSpecificDate('');
    setCategoryFilter('');
    setStatusFilter('');
    setDateRange('monthly');
  };

  const handleExportPDF = () => {
    const today = new Date().toISOString().slice(0, 10);
    const filename = `Tasks_${dateRange}_${today}.pdf`;
    const filters = {
      date: specificDate,
      category: categoryFilter,
      status: statusFilter
    };
    exportTasksToPDF(filteredTasks, filename, viewMode === 'all', dateRange, filters);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-sky-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Task Manager Mumbu</h1>
            <div className="text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm">
              Signed in as: <span className="font-semibold">{username}</span>
              {isAdmin && <span className="ml-2 text-sky-600">(Admin)</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewTaskClick}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium shadow-lg"
            >
              + New Task
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6">
            <AdminControls
              users={users}
              viewMode={viewMode}
              selectedUser={selectedUser}
              onViewModeChange={handleViewModeChange}
              onAddEmployee={() => setIsAddEmployeeOpen(true)}
            />
          </div>
        )}

        {/* Status Counters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-700 text-white rounded-lg p-4 text-center shadow">
            <div className="text-3xl font-bold">{filteredTasks.length}</div>
            <div className="text-sm mt-1">Total Tasks</div>
          </div>
          
          {[1, 2, 3, 4].map((statusId) => (
            <div
              key={statusId}
              className="rounded-lg p-4 text-center shadow"
              style={{
                backgroundColor: statusColors[statusId as keyof typeof statusColors].bg,
                color: statusColors[statusId as keyof typeof statusColors].text,
              }}
            >
              <div className="text-3xl font-bold">{statusCounts[statusId as keyof typeof statusCounts]}</div>
              <div className="text-sm mt-1">{statusNames[statusId - 1]}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Content Area */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-slate-500">Loading tasks...</div>
          </div>
        ) : (
          <>
            {/* Kanban View */}
            {activeTab === 'kanban' && (
              <KanbanBoard
                tasks={allTasks}
                selectedDate={kanbanDate}
                onDateChange={setKanbanDate}
                onTaskEdit={handleEditClick}
                onTaskDelete={handleDeleteTask}
                onTaskStatusChange={handleTaskStatusChange}
              />
            )}

            {/* Table View with Filters */}
            {activeTab === 'table' && (
              <div>
                {/* Filters */}
                <TaskFilters
                  dateRange={dateRange}
                  specificDate={specificDate}
                  category={categoryFilter}
                  status={statusFilter}
                  onDateRangeChange={setDateRange}
                  onSpecificDateChange={setSpecificDate}
                  onCategoryChange={setCategoryFilter}
                  onStatusChange={setStatusFilter}
                  onClearFilters={handleClearFilters}
                  onExport={handleExportPDF}
                />

                {/* Summary Statistics */}
                <SummaryStats tasks={filteredTasks} />

                {/* Task Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Filtered Tasks
                    </h2>
                    <div className="text-sm text-slate-600">
                      Showing {filteredTasks.length} of {allTasks.length} tasks
                    </div>
                  </div>
                  
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      {allTasks.length === 0
                        ? "No tasks yet. Click 'New Task' to create your first task!"
                        : 'No tasks match the selected filters. Try adjusting your filters.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b">
                            <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                            {viewMode === 'all' && (
                              <th className="text-left p-3 font-semibold text-slate-700">User</th>
                            )}
                            <th className="text-left p-3 font-semibold text-slate-700">Category</th>
                            <th className="text-left p-3 font-semibold text-slate-700">Title</th>
                            <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                            <th className="text-left p-3 font-semibold text-slate-700">Time</th>
                            <th className="text-left p-3 font-semibold text-slate-700">Duration</th>
                            <th className="text-left p-3 font-semibold text-slate-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((task) => (
                            <tr key={task._id} className="border-b hover:bg-slate-50">
                              <td className="p-3">
                                <input
                                  type="date"
                                  value={task.date}
                                  onChange={(e) =>
                                    handleTaskDateChange(task._id, e.target.value)
                                  }
                                  className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              {viewMode === 'all' && (
                                <td className="p-3 text-slate-700 font-medium">
                                  {task.userId}
                                </td>
                              )}
                              <td className="p-3 text-slate-700">
                                <div className="font-medium">{task.category}</div>
                                <div className="text-sm text-slate-500">
                                  {task.subcategory}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-medium text-slate-700">
                                  {task.title}
                                </div>
                                {task.description && (
                                  <div className="text-sm text-slate-500 truncate max-w-xs">
                                    {task.description}
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className="px-3 py-1 rounded-full text-sm font-medium"
                                  style={{
                                    backgroundColor:
                                      statusColors[task.statusId as keyof typeof statusColors]
                                        .bg,
                                    color:
                                      statusColors[task.statusId as keyof typeof statusColors]
                                        .text,
                                  }}
                                >
                                  {statusNames[task.statusId - 1]}
                                </span>
                              </td>
                              <td className="p-3 text-slate-700 text-sm">
                                {task.startTime} - {task.endTime}
                              </td>
                              <td className="p-3 text-slate-700 font-medium">
                                {formatDuration(task.durationMinutes)}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditClick(task)}
                                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                                  >
                                    ✎ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports View */}
            {activeTab === 'reports' && (
              <ReportsTab tasks={allTasks} />
            )}

            {/* Weekly Planner View */}
            {activeTab === 'weekly' && (
              <WeeklyPlanner />
            )}
          </>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onSuccess={handleEmployeeAdded}
      />
    </div>
  );
}