import { UserService } from "../../services/UserService";
import { AppError } from "../../utils/errors";
import { CreateUserRequest } from "../../models/UserModel";

const mockCollection = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  find: jest.fn(),
};

const mockFastify = {
  mongo: {
    db: {
      collection: jest.fn().mockReturnValue(mockCollection),
    },
  },
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(mockFastify as any);
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    const userData: CreateUserRequest = {
      email: "test@example.com",
    };

    it("should create user successfully", async () => {
      const insertedId = "507f1f77bcf86cd799439011";
      const insertedUser = {
        _id: { toString: () => insertedId },
        email: "test@example.com",
        createdAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(null); // No existing user
      mockCollection.insertOne.mockResolvedValueOnce({ insertedId });
      mockCollection.findOne.mockResolvedValueOnce(insertedUser);

      const result = await userService.createUser(userData);

      expect(result).toEqual({
        id: insertedId,
        email: "test@example.com",
        createdAt: insertedUser.createdAt,
        updatedAt: insertedUser.createdAt,
      });
    });

    it("should throw error if email already exists", async () => {
      mockCollection.findOne.mockResolvedValueOnce({
        email: "test@example.com",
      });

      await expect(userService.createUser(userData)).rejects.toThrow(
        new AppError("Email already exists", 409)
      );
    });

    it("should throw error if user creation fails", async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);
      mockCollection.insertOne.mockResolvedValueOnce({ insertedId: "123" });
      mockCollection.findOne.mockResolvedValueOnce(null); // User not found after insert

      await expect(userService.createUser(userData)).rejects.toThrow(
        new AppError("Failed to create user", 500)
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users = [
        {
          _id: { toString: () => "1" },
          email: "user1@example.com",
          createdAt: new Date(),
        },
        {
          _id: { toString: () => "2" },
          email: "user2@example.com",
          createdAt: new Date(),
        },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(users),
      });

      const result = await userService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "1",
        email: "user1@example.com",
        createdAt: users[0].createdAt,
        updatedAt: users[0].createdAt,
      });
    });

    it("should throw error if database connection not established", async () => {
      const userServiceWithoutDb = new UserService({
        mongo: { db: null },
      } as any);

      await expect(userServiceWithoutDb.getAllUsers()).rejects.toThrow(
        new AppError("Database connection not established", 500)
      );
    });

    it("should return empty array when no users", async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await userService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should return user by valid ObjectId", async () => {
      const userId = "507f1f77bcf86cd799439011";
      const user = {
        _id: { toString: () => userId },
        email: "test@example.com",
        createdAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(user);

      const result = await userService.getUserById(userId);

      expect(result).toEqual({
        id: userId,
        email: "test@example.com",
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      });
    });

    it("should throw error for invalid user ID", async () => {
      await expect(userService.getUserById("invalid-id")).rejects.toThrow(
        new AppError("Invalid user ID", 400)
      );
    });

    it("should throw error when user not found", async () => {
      const userId = "507f1f77bcf86cd799439011";
      mockCollection.findOne.mockResolvedValueOnce(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });
  });
});
