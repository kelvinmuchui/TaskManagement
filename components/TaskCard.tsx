'use client ';

import { statusColors} from '@/lib/categories';

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
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

export default function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      }
      const colors = statusColors[task.statusId as keyof typeof statusColors];
      return (
    <div
      className={`rounded-lg p-3 mb-3 shadow-sm cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: '4px solid rgba(0,0,0,0.08)',
      }}
      draggable
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
          
          <p className="text-xs opacity-90 mb-1">
            {task.category} → {task.subcategory}
          </p>
          
          {task.description && (
            <p className="text-xs mt-2 opacity-80 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.carriedOver && (
            <span className="inline-block text-xs bg-orange-500 text-white px-2 py-0.5 rounded mt-2">
              🔄 Carried Over
            </span>
          )}
          
          <div className="mt-2 space-y-1">
            <p className="text-xs">
              <span className="font-semibold">Date:</span> {task.date}
            </p>
            <p className="text-xs">
              <span className="font-semibold">Time:</span> {task.startTime} - {task.endTime}
            </p>
            <p className="text-xs">
              <span className="font-semibold">Duration:</span> {formatDuration(task.durationMinutes)}
            </p>
            <p className="text-xs">
              <span className="font-semibold">User:</span> {task.userId}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-sm px-2 py-1 rounded-md bg-white/30 hover:bg-white/50 transition-colors"
            title="Edit task"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="text-sm px-2 py-1 rounded-md bg-white/30 hover:bg-white/50 transition-colors"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

