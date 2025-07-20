import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import {
  UserFavorite,
  FavoriteWithMediaDetails,
} from "../models/FavoriteModel";
import { AppError } from "../utils/errors";

export class FavoriteService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  private validateDatabaseConnection(): void {
    if (!this.fastify.mongo.db) {
      throw new AppError("Database connection not established", 500);
    }
  }

  private getCollection(collectionName: string) {
    this.validateDatabaseConnection();
    const collection = this.fastify.mongo.db!.collection(collectionName);
    if (!collection) {
      throw new AppError(`${collectionName} collection not found`, 500);
    }
    return collection;
  }

  private validateUserExists = async (userId: string): Promise<void> => {
    if (ObjectId.isValid(userId)) {
      const userCollection = this.getCollection("users");
      const userExists = await userCollection.findOne({
        _id: new ObjectId(userId),
      });
      if (!userExists) {
        throw new AppError("User not found", 404);
      }
    }
  };

  private validateMediaExists = async (mediaId: string): Promise<void> => {
    if (!ObjectId.isValid(mediaId)) {
      throw new AppError("Media not found", 404);
    }

    const mediaCollection = this.getCollection("media");
    const mediaExists = await mediaCollection.findOne({
      _id: new ObjectId(mediaId),
    });
    if (!mediaExists) {
      throw new AppError("Media not found", 404);
    }
  };

  async addToFavorites(userId: string, mediaId: string): Promise<void> {
    const favoritesCollection = this.getCollection("favorites");

    await this.validateUserExists(userId);
    await this.validateMediaExists(mediaId);

    const existingFavorite = await favoritesCollection.findOne({
      userId,
      mediaId,
    });

    if (existingFavorite) {
      throw new AppError("Media already in favorites", 409);
    }

    await favoritesCollection.insertOne({
      userId,
      mediaId,
      addedAt: new Date(),
    });
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithMediaDetails[]> {
    const favoritesCollection = this.getCollection("favorites");

    await this.validateUserExists(userId);

    const favorites = await favoritesCollection
      .aggregate([
        {
          $match: { userId },
        },
        {
          $addFields: {
            mediaObjectId: { $toObjectId: "$mediaId" },
          },
        },
        {
          $lookup: {
            from: "media",
            localField: "mediaObjectId",
            foreignField: "_id",
            as: "mediaDetails",
          },
        },
        {
          $unwind: "$mediaDetails",
        },
        {
          $project: {
            userId: 1,
            addedAt: 1,
            media: {
              id: { $toString: "$mediaDetails._id" },
              title: "$mediaDetails.title",
              description: "$mediaDetails.description",
              type: "$mediaDetails.type",
              releaseYear: "$mediaDetails.releaseYear",
              genre: "$mediaDetails.genre",
              createdAt: "$mediaDetails.createdAt",
            },
          },
        },
      ])
      .toArray();

    return favorites as FavoriteWithMediaDetails[];
  }

  async removeFromFavorites(userId: string, mediaId: string): Promise<void> {
    const favoritesCollection = this.getCollection("favorites");

    await this.validateUserExists(userId);

    const existingFavorite = await favoritesCollection.findOne({
      userId,
      mediaId,
    });

    if (!existingFavorite) {
      throw new AppError("Favorite not found", 404);
    }

    const result = await favoritesCollection.deleteOne({
      userId,
      mediaId,
    });

    if (result.deletedCount === 0) {
      throw new AppError("Failed to remove favorite", 500);
    }
  }

  async isFavorite(userId: string, mediaId: string): Promise<boolean> {
    const favoritesCollection = this.getCollection("favorites");

    const favorite = await favoritesCollection.findOne({
      userId,
      mediaId,
    });

    return !!favorite;
  }
}
