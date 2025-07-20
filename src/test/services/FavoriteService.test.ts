import { FavoriteService } from "../../services/FavoriteService";
import { AppError } from "../../utils/errors";

const mockFavoritesCollection = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
  deleteOne: jest.fn(),
  aggregate: jest.fn(),
};

const mockMediaCollection = {
  findOne: jest.fn(),
};

const mockUserCollection = {
  findOne: jest.fn(),
};

const mockFastify = {
  mongo: {
    db: {
      collection: jest.fn((name: string) => {
        switch (name) {
          case "favorites":
            return mockFavoritesCollection;
          case "media":
            return mockMediaCollection;
          case "users":
            return mockUserCollection;
          default:
            return null;
        }
      }),
    },
  },
};

describe("FavoriteService", () => {
  let favoriteService: FavoriteService;

  beforeEach(() => {
    favoriteService = new FavoriteService(mockFastify as any);
    jest.clearAllMocks();
  });

  describe("addToFavorites", () => {
    const userId = "507f1f77bcf86cd799439011";
    const mediaId = "507f1f77bcf86cd799439012";

    it("should add to favorites successfully", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockMediaCollection.findOne.mockResolvedValueOnce({ _id: mediaId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce(null);
      mockFavoritesCollection.insertOne.mockResolvedValueOnce({
        insertedId: "123",
      });

      await favoriteService.addToFavorites(userId, mediaId);

      expect(mockFavoritesCollection.insertOne).toHaveBeenCalledWith({
        userId,
        mediaId,
        addedAt: expect.any(Date),
      });
    });

    it("should throw error if user not found", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce(null);

      await expect(
        favoriteService.addToFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("User not found", 404));
    });

    it("should throw error for invalid user ID", async () => {
      await expect(
        favoriteService.addToFavorites(userId, "invalid-id")
      ).rejects.toThrow(new AppError("User not found", 404));
    });

    it("should throw error if media not found", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockMediaCollection.findOne.mockResolvedValueOnce(null);

      await expect(
        favoriteService.addToFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("Media not found", 404));
    });

    it("should throw error if media already in favorites", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockMediaCollection.findOne.mockResolvedValueOnce({ _id: mediaId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce({
        userId,
        mediaId,
      });

      await expect(
        favoriteService.addToFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("Media already in favorites", 409));
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new FavoriteService(mockFastifyWithoutDb as any);

      await expect(
        serviceWithoutDb.addToFavorites(userId, mediaId)
      ).rejects.toThrow();
    });

    it("should throw error if collections don't exist", async () => {
      const mockFastifyWithoutCollections = {
        mongo: {
          db: {
            collection: jest.fn().mockReturnValue(null),
          },
        },
      };

      const serviceWithoutCollections = new FavoriteService(
        mockFastifyWithoutCollections as any
      );

      await expect(() =>
        serviceWithoutCollections.addToFavorites(userId, mediaId)
      ).rejects.toThrow();
    });

    it("should throw error if insertOne fails", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockMediaCollection.findOne.mockResolvedValueOnce({ _id: mediaId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce(null);
      mockFavoritesCollection.insertOne.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(
        favoriteService.addToFavorites(userId, mediaId)
      ).rejects.toThrow("Database error");
    });

    it("should handle invalid userId gracefully", async () => {
      const invalidUserId = "invalid-user-id";

      // When userId is invalid, it skips user validation and goes to media validation
      await expect(
        favoriteService.addToFavorites(invalidUserId, "invalid-media")
      ).rejects.toThrow(new AppError("Media not found", 404));
    });
  });

  describe("getUserFavorites", () => {
    const userId = "507f1f77bcf86cd799439011";

    it("should return user favorites with media details", async () => {
      const favorites = [
        {
          id: "1",
          userId: userId,
          mediaId: "507f1f77bcf86cd799439012",
          addedAt: new Date(),
          media: {
            id: "507f1f77bcf86cd799439012",
            title: "Test Movie",
            description: "Test description",
            type: "MOVIE",
            releaseYear: 2023,
            genre: "Action",
            createdAt: new Date(),
          },
        },
      ];

      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(favorites),
      });

      const result = await favoriteService.getUserFavorites(userId);

      expect(result).toEqual(favorites);
      expect(mockFavoritesCollection.aggregate).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce(null);

      await expect(favoriteService.getUserFavorites(userId)).rejects.toThrow(
        new AppError("User not found", 404)
      );
    });

    it("should return empty array when user has no favorites", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await favoriteService.getUserFavorites(userId);

      expect(result).toEqual([]);
    });

    it("should handle invalid userId gracefully", async () => {
      const invalidUserId = "invalid-user-id";

      // When userId is invalid, it skips user validation and goes to aggregate
      mockFavoritesCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await favoriteService.getUserFavorites(invalidUserId);

      expect(result).toEqual([]);
    });

    it("should throw error if aggregate operation fails", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.aggregate.mockImplementation(() => {
        throw new Error("Aggregation failed");
      });

      await expect(favoriteService.getUserFavorites(userId)).rejects.toThrow(
        "Aggregation failed"
      );
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new FavoriteService(mockFastifyWithoutDb as any);

      await expect(serviceWithoutDb.getUserFavorites(userId)).rejects.toThrow();
    });
  });

  describe("removeFromFavorites", () => {
    const userId = "507f1f77bcf86cd799439011";
    const mediaId = "507f1f77bcf86cd799439012";

    it("should remove from favorites successfully", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce({
        userId,
        mediaId,
      });
      mockFavoritesCollection.deleteOne.mockResolvedValueOnce({
        deletedCount: 1,
      });

      await favoriteService.removeFromFavorites(userId, mediaId);

      expect(mockFavoritesCollection.deleteOne).toHaveBeenCalledWith({
        userId,
        mediaId,
      });
    });

    it("should throw error if user not found", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce(null);

      await expect(
        favoriteService.removeFromFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("User not found", 404));
    });

    it("should throw error if favorite not found", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce(null);

      await expect(
        favoriteService.removeFromFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("Favorite not found", 404));
    });

    it("should throw error if deletion fails", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce({
        userId,
        mediaId,
      });
      mockFavoritesCollection.deleteOne.mockResolvedValueOnce({
        deletedCount: 0,
      });

      await expect(
        favoriteService.removeFromFavorites(userId, mediaId)
      ).rejects.toThrow(new AppError("Failed to remove favorite", 500));
    });

    it("should handle invalid userId gracefully", async () => {
      const invalidUserId = "invalid-user-id";

      // When userId is invalid, it skips user validation
      mockFavoritesCollection.findOne.mockResolvedValueOnce(null);

      await expect(
        favoriteService.removeFromFavorites(invalidUserId, mediaId)
      ).rejects.toThrow(new AppError("Favorite not found", 404));
    });

    it("should throw error if deleteOne operation fails", async () => {
      mockUserCollection.findOne.mockResolvedValueOnce({ _id: userId });
      mockFavoritesCollection.findOne.mockResolvedValueOnce({
        userId,
        mediaId,
      });
      mockFavoritesCollection.deleteOne.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(
        favoriteService.removeFromFavorites(userId, mediaId)
      ).rejects.toThrow("Database error");
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new FavoriteService(mockFastifyWithoutDb as any);

      await expect(
        serviceWithoutDb.removeFromFavorites(userId, mediaId)
      ).rejects.toThrow();
    });
  });

  describe("isFavorite", () => {
    const userId = "507f1f77bcf86cd799439011";
    const mediaId = "507f1f77bcf86cd799439012";

    it("should return true if favorite exists", async () => {
      mockFavoritesCollection.findOne.mockResolvedValueOnce({
        userId,
        mediaId,
      });

      const result = await favoriteService.isFavorite(userId, mediaId);

      expect(result).toBe(true);
    });

    it("should return false if favorite doesn't exist", async () => {
      mockFavoritesCollection.findOne.mockResolvedValueOnce(null);

      const result = await favoriteService.isFavorite(userId, mediaId);

      expect(result).toBe(false);
    });

    it("should throw error if findOne operation fails", async () => {
      mockFavoritesCollection.findOne.mockRejectedValueOnce(
        new Error("Query failed")
      );

      await expect(favoriteService.isFavorite(userId, mediaId)).rejects.toThrow(
        "Query failed"
      );
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new FavoriteService(mockFastifyWithoutDb as any);

      await expect(
        serviceWithoutDb.isFavorite(userId, mediaId)
      ).rejects.toThrow();
    });
  });
});
