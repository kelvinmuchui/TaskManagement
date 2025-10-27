// app/api/weekly-notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { WeeklyNoteModel } from '@/lib/models/WeeklyNotes';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    
    if (!weekStart) {
      return NextResponse.json({ error: 'weekStart parameter required' }, { status: 400 });
    }
    
    const notes = await WeeklyNoteModel.getNotesByUserAndWeek(username, weekStart);
    
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('GET /api/weekly-notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const body = await request.json();
    const { dayOfWeek, text, weekStart } = body;
    
    if (!dayOfWeek || !text || !weekStart) {
      return NextResponse.json(
        { error: 'dayOfWeek, text, and weekStart are required' },
        { status: 400 }
      );
    }
    
    const note = await WeeklyNoteModel.createNote({
      userId: username,
      dayOfWeek,
      text,
      done: false,
      weekStart,
    });
    
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('POST /api/weekly-notes error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const body = await request.json();
    const { id, done, text } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    
    const updates: any = {};
    if (typeof done === 'boolean') updates.done = done;
    if (text) updates.text = text;
    
    const note = await WeeklyNoteModel.updateNote(id, updates, username);
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ note });
  } catch (error) {
    console.error('PUT /api/weekly-notes error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const weekStart = searchParams.get('weekStart');
    
    if (id) {
      // Delete single note
      const deleted = await WeeklyNoteModel.deleteNote(id, username);
      
      if (!deleted) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      
      return NextResponse.json({ success: true });
    } else if (dayOfWeek && weekStart) {
      // Clear all notes for a day
      const count = await WeeklyNoteModel.clearDayNotes(username, dayOfWeek, weekStart);
      
      return NextResponse.json({ success: true, deletedCount: count });
    } else {
      return NextResponse.json(
        { error: 'id or (dayOfWeek and weekStart) required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('DELETE /api/weekly-notes error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}