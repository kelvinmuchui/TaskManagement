// app/api/tasks/route.ts - UPDATED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { TaskModel } from '@/lib/models/Task';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const isAdmin = (session.user as any).isAdmin;
    
    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode') || 'self';
    const viewUser = searchParams.get('viewUser');
    const date = searchParams.get('date') || undefined;
    const category = searchParams.get('category') || undefined;
    const statusId = searchParams.get('statusId') ? parseInt(searchParams.get('statusId')!) : undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    
    const filters = { date, category, statusId, startDate, endDate };
    
    let tasks;
    
    if (isAdmin && viewMode === 'all') {
      // Admin viewing all users
      tasks = await TaskModel.getAllTasks(filters);
    } else if (isAdmin && viewMode === 'user' && viewUser) {
      // Admin viewing specific user
      tasks = await TaskModel.getTasksByUser(viewUser, filters);
    } else {
      // Regular user or admin viewing own tasks
      tasks = await TaskModel.getTasksByUser(username, filters);
    }
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = (session.user as any).username;
    const isAdmin = (session.user as any).isAdmin;
    
    const body = await request.json();
    const {
      userId, // Admin can create tasks for other users
      date,
      category,
      subcategory,
      title,
      description,
      statusId,
      startTime,
      endTime
    } = body;
    
    // Validation
    if (!date || !category || !subcategory || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Determine task owner
    let taskUserId = username;
    if (isAdmin && userId) {
      taskUserId = userId;
    }
    
    const task = await TaskModel.createTask({
      userId: taskUserId,
      date,
      category,
      subcategory,
      title,
      description: description || '',
      statusId: statusId || 1,
      startTime,
      endTime,
      durationMinutes: 0 // Will be calculated by the model
    });
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}