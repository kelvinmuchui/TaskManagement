// lib/models/User.ts
import clientPromise from '../mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt?: Date;
}

const DB_NAME = 'taskmanager';
const COLLECTION = 'users';

export class UserModel {
  static async getCollection() {
    const client = await clientPromise;
    return client.db(DB_NAME).collection<User>(COLLECTION);
  }

  static async createUser(username: string, password: string, isAdmin: boolean = false) {
    const collection = await this.getCollection();
    
    // Check if user exists
    const existing = await collection.findOne({ username });
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      username,
      password: hashedPassword,
      isAdmin,
      createdAt: new Date()
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findByUsername(username: string) {
    const collection = await this.getCollection();
    return await collection.findOne({ username });
  }

  static async validatePassword(user: User, password: string) {
    return await bcrypt.compare(password, user.password);
  }

  static async getAllUsers() {
    const collection = await this.getCollection();
    return await collection.find({}, { projection: { password: 0 } }).toArray();
  }

  static async initializeAdmin() {
    const collection = await this.getCollection();
    const adminExists = await collection.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await this.createUser('admin', 'admin', true);
      console.log('✅ Default admin user created (username: admin, password: admin)');
    }
  }
}