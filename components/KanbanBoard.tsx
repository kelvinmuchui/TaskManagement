// components/KanbanBoard.tsx
'use client';

import { useState, DragEvent } from 'react';
import TaskCard from './TaskCard';
import { statusNames } from '@/lib/categories';

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
  carriedOver?: boolean;
}

interface KanbanBoardProps {
  tasks: Task[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, newStatusId: number) => Promise<void>;
}

export default function KanbanBoard({
  tasks,
  selectedDate,
  onDateChange,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
}: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  // Filter tasks by selected date
  const filteredTasks = tasks.filter((task) => task.date === selectedDate);

  // Group tasks by status
  const tasksByStatus: Record<number, Task[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
  };

  filteredTasks.forEach((task) => {
    tasksByStatus[task.statusId].push(task);
  });

  const handleDragStart = (e: DragEvent, task: Task) => {
    setDraggedTaskId(task._id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: DragEvent, statusId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(statusId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent, newStatusId: number) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTaskId) return;

    const draggedTask = filteredTasks.find((t) => t._id === draggedTaskId);
    if (!draggedTask) return;

    // Don't do anything if dropped in same column
    if (draggedTask.statusId === newStatusId) {
      setDraggedTaskId(null);
      return;
    }

    // Update task status
    await onTaskStatusChange(draggedTaskId, newStatusId);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const clearDate = () => {
    const today = new Date().toISOString().slice(0, 10);
    onDateChange(today);
  };

  return (
    <div>
      {/* Date Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="kanbanDate" className="font-medium text-slate-700">
          Select Date:
        </label>
        <input
          type="date"
          id="kanbanDate"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-slate-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        <button
          onClick={clearDate}
          className="border border-slate-300 px-3 py-2 rounded-md hover:bg-sky-50 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((statusId) => (
          <div
            key={statusId}
            className={`rounded-lg bg-white shadow-sm p-3 min-h-[400px] transition-all ${
              dragOverColumn === statusId
                ? 'ring-2 ring-sky-500 bg-sky-50'
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, statusId)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, statusId)}
          >
            <h3 className="font-semibold mb-3 text-slate-700 flex items-center justify-between">
              <span>{statusNames[statusId - 1]}</span>
              <span className="text-sm bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {tasksByStatus[statusId].length}
              </span>
            </h3>

            <div className="space-y-2">
              {tasksByStatus[statusId].map((task) => (
                <div
                  key={task._id}
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                >
                  <TaskCard
                    task={task}
                    onEdit={onTaskEdit}
                    onDelete={onTaskDelete}
                    isDragging={draggedTaskId === task._id}
                  />
                </div>
              ))}

              {tasksByStatus[statusId].length === 0 && (
                <div className="text-center text-slate-400 text-sm py-8">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center text-slate-500 py-12">
          <p className="text-lg">No tasks for {selectedDate}</p>
          <p className="text-sm mt-2">
            Select a different date or create a new task
          </p>
        </div>
      )}
    </div>
  );
}