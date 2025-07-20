import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import {
  UserFavorite,
  FavoriteWithMediaDetails,
} from "../models/FavoriteModel";
import { NotFoundError, ServerError, ConflictError } from "../utils/errors";

export class FavoriteService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async addToFavorites(userId: string, mediaId: string): Promise<void> {
    try {
      const favoritesCollection =
        this.fastify.mongo.db!.collection("favorites");
      const mediaCollection = this.fastify.mongo.db!.collection("media");
      const userCollection = this.fastify.mongo.db!.collection("users");

      if (ObjectId.isValid(userId)) {
        const userExists = await userCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!userExists) {
          throw new NotFoundError("User");
        }
      }

      if (!ObjectId.isValid(mediaId)) {
        throw new NotFoundError("Media");
      }

      const mediaExists = await mediaCollection.findOne({
        _id: new ObjectId(mediaId),
      });
      if (!mediaExists) {
        throw new NotFoundError("Media");
      }

      const existingFavorite = await favoritesCollection.findOne({
        userId,
        mediaId,
      });

      if (existingFavorite) {
        throw new ConflictError("Media already in favorites");
      }

      await favoritesCollection.insertOne({
        userId,
        mediaId,
        addedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new ServerError("Failed to add to favorites");
    }
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithMediaDetails[]> {
    try {
      if (ObjectId.isValid(userId)) {
        const userCollection = this.fastify.mongo.db!.collection("users");
        const userExists = await userCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!userExists) {
          throw new NotFoundError("User");
        }
      }

      const favoritesCollection =
        this.fastify.mongo.db!.collection("favorites");

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
              id: { $toString: "$_id" },
              userId: 1,
              mediaId: 1,
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
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError("Failed to fetch user favorites");
    }
  }

  async removeFromFavorites(userId: string, mediaId: string): Promise<void> {
    try {
      const favoritesCollection =
        this.fastify.mongo.db!.collection("favorites");
      const userCollection = this.fastify.mongo.db!.collection("users");

      if (ObjectId.isValid(userId)) {
        const userExists = await userCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!userExists) {
          throw new NotFoundError("User");
        }
      }

      const existingFavorite = await favoritesCollection.findOne({
        userId,
        mediaId,
      });

      if (!existingFavorite) {
        throw new NotFoundError("Favorite");
      }

      const result = await favoritesCollection.deleteOne({
        userId,
        mediaId,
      });

      if (result.deletedCount === 0) {
        throw new ServerError("Failed to remove from favorites");
      }
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ServerError) {
        throw error;
      }
      throw new ServerError("Failed to remove from favorites");
    }
  }

  async isFavorite(userId: string, mediaId: string): Promise<boolean> {
    try {
      const favoritesCollection =
        this.fastify.mongo.db!.collection("favorites");

      const favorite = await favoritesCollection.findOne({
        userId,
        mediaId,
      });

      return !!favorite;
    } catch (error) {
      throw new ServerError("Failed to check favorite status");
    }
  }
}
