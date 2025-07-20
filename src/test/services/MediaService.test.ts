import { MediaService } from "../../services/MediaService";
import { AppError } from "../../utils/errors";
import { CreateMediaRequest } from "../../models/MediaModel";

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

describe("MediaService", () => {
  let mediaService: MediaService;

  beforeEach(() => {
    mediaService = new MediaService(mockFastify as any);
    jest.clearAllMocks();
  });

  describe("createMedia", () => {
    const mediaData: CreateMediaRequest = {
      title: "Test Movie",
      description: "Test description",
      type: "movie",
      releaseYear: 2023,
      genre: "Action",
    };

    it("should create media successfully", async () => {
      const insertedId = "507f1f77bcf86cd799439011";
      const insertedMedia = {
        _id: { toString: () => insertedId },
        ...mediaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock para não encontrar mídia existente com o mesmo título
      mockCollection.findOne.mockResolvedValueOnce(null);
      mockCollection.insertOne.mockResolvedValueOnce({ insertedId });
      mockCollection.findOne.mockResolvedValueOnce(insertedMedia);

      const result = await mediaService.createMedia(mediaData);

      expect(result).toEqual({
        id: insertedId,
        title: mediaData.title,
        description: mediaData.description,
        type: mediaData.type,
        releaseYear: mediaData.releaseYear,
        genre: mediaData.genre,
        createdAt: insertedMedia.createdAt,
        updatedAt: insertedMedia.updatedAt,
      });
    });

    it("should throw error if collection doesn't exist", async () => {
      const mockFastifyWithoutCollection = {
        mongo: {
          db: {
            collection: jest.fn().mockReturnValue(null),
          },
        },
      };

      const serviceWithoutCollection = new MediaService(
        mockFastifyWithoutCollection as any
      );
      mockFastifyWithoutCollection.mongo.db.collection.mockReturnValue(null);

      await expect(() =>
        serviceWithoutCollection.createMedia(mediaData)
      ).rejects.toThrow();
    });

    it("should throw error if insertOne fails", async () => {
      // Mock para não encontrar mídia existente
      mockCollection.findOne.mockResolvedValueOnce(null);
      // Mock para falhar na inserção
      mockCollection.insertOne.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(mediaService.createMedia(mediaData)).rejects.toThrow(
        "Database error"
      );
    });

    it("should throw error if media with same title exists", async () => {
      // Mock para encontrar mídia existente com mesmo título
      mockCollection.findOne.mockResolvedValueOnce({
        _id: "existing-id",
        title: mediaData.title,
      });

      await expect(mediaService.createMedia(mediaData)).rejects.toThrow(
        new AppError("Media with this title already exists", 400)
      );
    });

    it("should throw error if failed to retrieve created media", async () => {
      const insertedId = "507f1f77bcf86cd799439011";

      // Mock para não encontrar mídia existente
      mockCollection.findOne.mockResolvedValueOnce(null);
      // Mock para inserção bem-sucedida
      mockCollection.insertOne.mockResolvedValueOnce({ insertedId });
      // Mock para falhar na busca da mídia criada
      mockCollection.findOne.mockResolvedValueOnce(null);

      await expect(mediaService.createMedia(mediaData)).rejects.toThrow(
        new AppError("Failed to create media", 500)
      );
    });
  });

  describe("getAllMedia", () => {
    it("should return all media", async () => {
      const medias = [
        {
          _id: { toString: () => "1" },
          title: "Movie 1",
          description: "Description 1",
          type: "movie",
          releaseYear: 2023,
          genre: "Action",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: { toString: () => "2" },
          title: "Movie 2",
          description: "Description 2",
          type: "series",
          releaseYear: 2022,
          genre: "Drama",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(medias),
      });

      const result = await mediaService.getAllMedia();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("should return empty array when no media exists", async () => {
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });

      const result = await mediaService.getAllMedia();

      expect(result).toEqual([]);
    });

    it("should throw error if collection doesn't exist", async () => {
      const mockFastifyWithoutCollection = {
        mongo: {
          db: {
            collection: jest.fn().mockReturnValue(null),
          },
        },
      };

      const serviceWithoutCollection = new MediaService(
        mockFastifyWithoutCollection as any
      );

      await expect(() =>
        serviceWithoutCollection.getAllMedia()
      ).rejects.toThrow();
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new MediaService(mockFastifyWithoutDb as any);

      await expect(serviceWithoutDb.getAllMedia()).rejects.toThrow();
    });

    it("should throw error if find operation fails", async () => {
      mockCollection.find.mockImplementation(() => {
        throw new Error("Database connection lost");
      });

      await expect(mediaService.getAllMedia()).rejects.toThrow(
        "Database connection lost"
      );
    });
  });

  describe("getMediaById", () => {
    const validId = "507f1f77bcf86cd799439011";

    it("should return media by valid ID", async () => {
      const media = {
        _id: { toString: () => validId },
        title: "Test Movie",
        description: "Test description",
        type: "movie",
        releaseYear: 2023,
        genre: "Action",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCollection.findOne.mockResolvedValueOnce(media);

      const result = await mediaService.getMediaById(validId);

      expect(result.id).toBe(validId);
      expect(result.title).toBe("Test Movie");
    });

    it("should throw error for invalid media ID", async () => {
      await expect(mediaService.getMediaById("invalid-id")).rejects.toThrow(
        new AppError("Invalid media ID", 400)
      );
    });

    it("should throw error for empty ID", async () => {
      await expect(mediaService.getMediaById("")).rejects.toThrow(
        new AppError("Invalid media ID", 400)
      );
    });

    it("should throw error when media not found", async () => {
      mockCollection.findOne.mockResolvedValueOnce(null);

      await expect(mediaService.getMediaById(validId)).rejects.toThrow(
        new AppError("Media not found", 404)
      );
    });

    it("should throw error if collection doesn't exist", async () => {
      const mockFastifyWithoutCollection = {
        mongo: {
          db: {
            collection: jest.fn().mockReturnValue(null),
          },
        },
      };

      const serviceWithoutCollection = new MediaService(
        mockFastifyWithoutCollection as any
      );

      await expect(() =>
        serviceWithoutCollection.getMediaById(validId)
      ).rejects.toThrow();
    });

    it("should throw error if database is not connected", async () => {
      const mockFastifyWithoutDb = {
        mongo: {
          db: null,
        },
      };

      const serviceWithoutDb = new MediaService(mockFastifyWithoutDb as any);

      await expect(serviceWithoutDb.getMediaById(validId)).rejects.toThrow();
    });

    it("should throw error if findOne operation fails", async () => {
      mockCollection.findOne.mockRejectedValueOnce(new Error("Network error"));

      await expect(mediaService.getMediaById(validId)).rejects.toThrow(
        "Network error"
      );
    });
  });
});
