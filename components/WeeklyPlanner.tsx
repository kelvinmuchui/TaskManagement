// components/WeeklyPlanner.tsx
'use client';

import { useState, useEffect } from 'react';

interface WeeklyNote {
  _id: string;
  userId: string;
  dayOfWeek: string;
  text: string;
  done: boolean;
  weekStart: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export default function WeeklyPlanner() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [notes, setNotes] = useState<WeeklyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteInputs, setNewNoteInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadNotes();
  }, [currentWeekStart]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const weekStartStr = currentWeekStart.toISOString().slice(0, 10);
      const response = await fetch(`/api/weekly-notes?weekStart=${weekStartStr}`);
      const data = await response.json();

      if (response.ok) {
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (dayOfWeek: string) => {
    const text = newNoteInputs[dayOfWeek]?.trim();
    if (!text) return;

    try {
      const weekStartStr = currentWeekStart.toISOString().slice(0, 10);
      const response = await fetch('/api/weekly-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek, text, weekStart: weekStartStr }),
      });

      if (response.ok) {
        setNewNoteInputs({ ...newNoteInputs, [dayOfWeek]: '' });
        await loadNotes();
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleToggleDone = async (noteId: string, currentDone: boolean) => {
    try {
      const response = await fetch('/api/weekly-notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: noteId, done: !currentDone }),
      });

      if (response.ok) {
        await loadNotes();
      }
    } catch (error) {
      console.error('Failed to toggle note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/weekly-notes?id=${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadNotes();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleClearDay = async (dayOfWeek: string) => {
    if (!confirm(`Clear all notes for ${dayOfWeek}?`)) return;

    try {
      const weekStartStr = currentWeekStart.toISOString().slice(0, 10);
      const response = await fetch(
        `/api/weekly-notes?dayOfWeek=${dayOfWeek}&weekStart=${weekStartStr}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        await loadNotes();
      }
    } catch (error) {
      console.error('Failed to clear day:', error);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const getNotesByDay = (dayOfWeek: string) => {
    return notes.filter((note) => note.dayOfWeek === dayOfWeek);
  };

  const formatWeekRange = () => {
    const monday = new Date(currentWeekStart);
    const sunday = new Date(currentWeekStart);
    sunday.setDate(sunday.getDate() + 6);

    const format = (date: Date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `${format(monday)} - ${format(sunday)}`;
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviousWeek}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 font-medium transition-colors"
            >
              ← Previous Week
            </button>
            <button
              onClick={handleThisWeek}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium transition-colors"
            >
              This Week
            </button>
            <button
              onClick={handleNextWeek}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 font-medium transition-colors"
            >
              Next Week →
            </button>
          </div>

          <div className="text-lg font-semibold text-slate-700">
            {formatWeekRange()}
          </div>
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-slate-500">Loading notes...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {daysOfWeek.map((day) => {
            const dayNotes = getNotesByDay(day);

            return (
              <div
                key={day}
                className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex flex-col min-h-[300px]"
              >
                {/* Day Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-lg text-slate-800">{day}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {dayNotes.length}
                  </span>
                </div>

                {/* Notes List */}
                <ul className="space-y-2 mb-3 flex-1 overflow-y-auto max-h-48">
                  {dayNotes.map((note) => (
                    <li
                      key={note._id}
                      className="flex items-start gap-2 text-sm group"
                    >
                      <input
                        type="checkbox"
                        checked={note.done}
                        onChange={() => handleToggleDone(note._id, note.done)}
                        className="mt-1 cursor-pointer"
                      />
                      <span
                        className={`flex-1 ${
                          note.done
                            ? 'line-through text-slate-400'
                            : 'text-slate-700'
                        }`}
                      >
                        {note.text}
                      </span>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Add Note Input */}
                <div className="space-y-2 mt-auto">
                  <input
                    type="text"
                    placeholder="New note..."
                    value={newNoteInputs[day] || ''}
                    onChange={(e) =>
                      setNewNoteInputs({
                        ...newNoteInputs,
                        [day]: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNote(day);
                      }
                    }}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddNote(day)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                    {dayNotes.length > 0 && (
                      <button
                        onClick={() => handleClearDay(day)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}