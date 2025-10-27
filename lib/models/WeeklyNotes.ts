// lib/models/WeeklyNote.ts
import clientPromise from '../mongodb';
import { ObjectId } from 'mongodb';

export interface WeeklyNote {
  _id?: ObjectId;
  userId: string;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  text: string;
  done: boolean;
  weekStart: string; // ISO date string for Monday of the week (YYYY-MM-DD)
  createdAt?: Date;
  updatedAt?: Date;
}

const DB_NAME = 'taskmanager';
const COLLECTION = 'weeklyNotes';

export class WeeklyNoteModel {
  static async getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection<WeeklyNote>(COLLECTION);
  }

  static async createNote(noteData: Omit<WeeklyNote, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    
    const note: WeeklyNote = {
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(note);
    return { ...note, _id: result.insertedId };
  }

  static async getNotesByUserAndWeek(userId: string, weekStart: string) {
    const collection = await this.getCollection();
    
    return await collection
      .find({ userId, weekStart })
      .sort({ createdAt: 1 })
      .toArray();
  }

  static async updateNote(id: string, updates: Partial<WeeklyNote>, userId: string) {
    const collection = await this.getCollection();
    
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async deleteNote(id: string, userId: string) {
    const collection = await this.getCollection();
    
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId,
    });

    return result.deletedCount > 0;
  }

  static async clearDayNotes(userId: string, dayOfWeek: string, weekStart: string) {
    const collection = await this.getCollection();
    
    const result = await collection.deleteMany({
      userId,
      dayOfWeek,
      weekStart,
    });

    return result.deletedCount;
  }

  static async clearWeekNotes(userId: string, weekStart: string) {
    const collection = await this.getCollection();
    
    const result = await collection.deleteMany({
      userId,
      weekStart,
    });

    return result.deletedCount;
  }
}