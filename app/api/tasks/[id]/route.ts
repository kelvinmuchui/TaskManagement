// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TaskModel } from '@/lib/models/Task';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }
    
    const username = (session.user as any).username;
    const isAdmin = (session.user as any).isAdmin;
    
    const task = await TaskModel.getTaskById(
      params.id,
      isAdmin ? undefined : username
    );
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }
    
    const username = (session.user as any).username;
    const isAdmin = (session.user as any).isAdmin;
    
    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    delete body._id;
    delete body.userId;
    delete body.createdAt;
    
    const task = await TaskModel.updateTask(
      params.id,
      body,
      isAdmin ? undefined : username
    );
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Validate ObjectId format
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }
    
    const username = (session.user as any).username;
    const isAdmin = (session.user as any).isAdmin;
    
    const deleted = await TaskModel.deleteTask(
      params.id,
      isAdmin ? undefined : username
    );
    
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}