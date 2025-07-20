import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { User, CreateUserRequest, UserResponse } from "../models/UserModel";
import { AppError } from "../utils/errors";

export class UserService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  private toUserResponse(user: User | any): UserResponse {
    return {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || user.createdAt,
    };
  }

  private documentToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt || doc.createdAt,
    };
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const userCollection = this.fastify.mongo.db!.collection("users");

    const existingUser = await userCollection.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const newUser = {
      email: userData.email,
      createdAt: new Date(),
    };

    const result = await userCollection.insertOne(newUser);
    const insertedUser = await userCollection.findOne({
      _id: result.insertedId,
    });

    if (!insertedUser) {
      throw new AppError("Failed to create user", 500);
    }

    const user = this.documentToUser(insertedUser);
    return this.toUserResponse(user);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    if (!this.fastify.mongo.db) {
      throw new AppError("Database connection not established", 500);
    }

    const userCollection = this.fastify.mongo.db!.collection("users");

    if (!userCollection) {
      throw new AppError("User collection not found", 500);
    }

    const users = await userCollection.find({}).toArray();

    return users.map((doc) => {
      const user = this.documentToUser(doc);
      return this.toUserResponse(user);
    });
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const userCollection = this.fastify.mongo.db!.collection("users");

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid user ID", 400);
    }

    const doc = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      throw new AppError("User not found", 404);
    }

    const user = this.documentToUser(doc);
    return this.toUserResponse(user);
  }
}
