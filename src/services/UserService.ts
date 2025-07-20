import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { User, CreateUserRequest, UserResponse } from "../models/UserModel";
import * as crypto from "crypto";

export class UserService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  private hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  private toUserResponse(user: User | any): UserResponse {
    return {
      id: user._id ? user._id.toString() : user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || user.createdAt,
    };
  }

  private documentToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
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
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const existingUsername = await userCollection.findOne({
      username: userData.username,
    });
    if (existingUsername) {
      throw new Error("USERNAME_ALREADY_EXISTS");
    }

    const newUser = {
      username: userData.username,
      email: userData.email,
      passwordHash: this.hashPassword(userData.password),
      createdAt: new Date(),
    };

    const result = await userCollection.insertOne(newUser);
    const insertedUser = await userCollection.findOne({
      _id: result.insertedId,
    });

    const user = this.documentToUser(insertedUser);
    return this.toUserResponse(user);
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const userCollection = this.fastify.mongo.db!.collection("users");
    const users = await userCollection.find({}).toArray();

    return users.map((doc) => {
      const user = this.documentToUser(doc);
      return this.toUserResponse(user);
    });
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    const userCollection = this.fastify.mongo.db!.collection("users");

    if (!ObjectId.isValid(id)) {
      return null;
    }

    const doc = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return null;
    }

    const user = this.documentToUser(doc);
    return this.toUserResponse(user);
  }
}
