import {
  validateCreateMediaRequest,
  validateCreateUserRequest,
  validateId,
} from "../../utils/validators";
import { CreateMediaRequest } from "../../models/MediaModel";
import { CreateUserRequest } from "../../models/UserModel";

describe("Validators", () => {
  describe("validateCreateMediaRequest", () => {
    it("should return null for valid media request", () => {
      const validMedia: CreateMediaRequest = {
        title: "Matrix",
        description: "A sci-fi movie",
        type: "movie",
        releaseYear: 1999,
        genre: "Sci-Fi",
      };

      const result = validateCreateMediaRequest(validMedia);
      expect(result).toBeNull();
    });

    it("should return error for empty title", () => {
      const invalidMedia: CreateMediaRequest = {
        title: "",
        description: "A sci-fi movie",
        type: "movie",
        releaseYear: 1999,
        genre: "Sci-Fi",
      };

      const result = validateCreateMediaRequest(invalidMedia);
      expect(result).toBe("Title is required and must be a valid string.");
    });

    it("should return error for invalid type", () => {
      const invalidMedia = {
        title: "Matrix",
        description: "A sci-fi movie",
        type: "invalid",
        releaseYear: 1999,
        genre: "Sci-Fi",
      } as unknown as CreateMediaRequest;

      const result = validateCreateMediaRequest(invalidMedia);
      expect(result).toBe('Type must be "movie" or "series".');
    });

    it("should return error for invalid release year", () => {
      const invalidMedia: CreateMediaRequest = {
        title: "Matrix",
        description: "A sci-fi movie",
        type: "movie",
        releaseYear: 1800,
        genre: "Sci-Fi",
      };

      const result = validateCreateMediaRequest(invalidMedia);
      expect(result).toContain("Release year must be a valid number");
    });
  });

  describe("validateCreateUserRequest", () => {
    it("should return null for valid user request", () => {
      const validUser: CreateUserRequest = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const result = validateCreateUserRequest(validUser);
      expect(result).toBeNull();
    });

    it("should return error for short username", () => {
      const invalidUser: CreateUserRequest = {
        username: "ab",
        email: "test@example.com",
        password: "password123",
      };

      const result = validateCreateUserRequest(invalidUser);
      expect(result).toBe("Username must be at least 3 characters long.");
    });

    it("should return error for invalid email", () => {
      const invalidUser: CreateUserRequest = {
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      };

      const result = validateCreateUserRequest(invalidUser);
      expect(result).toBe("Email must be a valid email address.");
    });

    it("should return error for short password", () => {
      const invalidUser: CreateUserRequest = {
        username: "testuser",
        email: "test@example.com",
        password: "123",
      };

      const result = validateCreateUserRequest(invalidUser);
      expect(result).toBe("Password must be at least 6 characters long.");
    });
  });

  describe("validateId", () => {
    it("should return null for valid ObjectId", () => {
      const validId = "507f1f77bcf86cd799439011";
      const result = validateId(validId);
      expect(result).toBeNull();
    });

    it("should return null for valid string ID", () => {
      const validId = "user123";
      const result = validateId(validId);
      expect(result).toBeNull();
    });

    it("should return error for empty ID", () => {
      const result = validateId("");
      expect(result).toBe("ID is required and must be a valid string.");
    });

    it("should return error for short ID", () => {
      const result = validateId("ab");
      expect(result).toBe(
        "ID must be at least 3 characters long or be a valid ObjectId."
      );
    });
  });
});
