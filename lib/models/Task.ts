// lib/models/Task.ts
import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

export interface Task {
  _id?: ObjectId;
  userId: string; // username of task owner
  date: string; // YYYY-MM-DD format
  category: string;
  subcategory: string;
  title: string;
  description: string;
  statusId: number; // 1=To Do, 2=Pending, 3=Done, 4=On Hold
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  durationMinutes: number;
  carriedOver?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const DB_NAME = 'taskmanager';
const COLLECTION = 'tasks';

export class TaskModel {
  static async getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection<Task>(COLLECTION);
  }

  static calculateDuration(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight tasks
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return Math.max(0, endMinutes - startMinutes);
  }

  static async createTask(taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    
    const duration = this.calculateDuration(taskData.startTime, taskData.endTime);
    
    const task: Task = {
      ...taskData,
      durationMinutes: duration,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(task);
    return { ...task, _id: result.insertedId };
  }

  static async getTasksByUser(userId: string, filters?: {
    date?: string;
    category?: string;
    statusId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const collection = await this.getCollection();
    
    const query: any = { userId };
    
    if (filters?.date) {
      query.date = filters.date;
    }
    
    if (filters?.category) {
      query.category = filters.category;
    }
    
    if (filters?.statusId) {
      query.statusId = filters.statusId;
    }
    
    if (filters?.startDate && filters?.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate
      };
    }
    
    return await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();
  }

  static async getAllTasks(filters?: {
    date?: string;
    category?: string;
    statusId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const collection = await this.getCollection();
    
    const query: any = {};
    
    if (filters?.date) {
      query.date = filters.date;
    }
    
    if (filters?.category) {
      query.category = filters.category;
    }
    
    if (filters?.statusId) {
      query.statusId = filters.statusId;
    }
    
    if (filters?.startDate && filters?.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate
      };
    }
    
    return await collection.find(query).sort({ date: -1, createdAt: -1 }).toArray();
  }

  static async getTaskById(id: string, userId?: string) {
    const collection = await this.getCollection();
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }
    
    return await collection.findOne(query);
  }

  static async updateTask(id: string, updates: Partial<Task>, userId?: string) {
    const collection = await this.getCollection();
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return null;
    }
    
    // Recalculate duration if times are being updated
    if (updates.startTime || updates.endTime) {
      const existingTask = await this.getTaskById(id, userId);
      if (existingTask) {
        const startTime = updates.startTime || existingTask.startTime;
        const endTime = updates.endTime || existingTask.endTime;
        updates.durationMinutes = this.calculateDuration(startTime, endTime);
      }
    }
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }
    
    const result = await collection.findOneAndUpdate(
      query,
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result;
  }

  static async deleteTask(id: string, userId?: string) {
    const collection = await this.getCollection();
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return false;
    }
    
    const query: any = { _id: new ObjectId(id) };
    if (userId) {
      query.userId = userId;
    }
    
    const result = await collection.deleteOne(query);
    return result.deletedCount > 0;
  }

  static async getTaskCountsByStatus(userId?: string) {
    const collection = await this.getCollection();
    
    const query = userId ? { userId } : {};
    
    const counts = await collection.aggregate([
      { $match: query },
      { $group: { _id: '$statusId', count: { $sum: 1 } } }
    ]).toArray();
    
    const result = { 1: 0, 2: 0, 3: 0, 4: 0 };
    counts.forEach((c: any) => {
      result[c._id as keyof typeof result] = c.count;
    });
    
    return result;
  }
}