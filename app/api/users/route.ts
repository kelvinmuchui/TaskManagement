// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserModel } from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isAdmin = (session.user as any).isAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const users = await UserModel.getAllUsers();
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isAdmin = (session.user as any).isAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const body = await request.json();
    const { username, password, isAdmin: makeAdmin } = body;
    
    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }
    
    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }
    
    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }
    
    try {
      const user = await UserModel.createUser(
        username.trim(),
        password,
        makeAdmin || false
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}