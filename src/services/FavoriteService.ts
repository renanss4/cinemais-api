import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import {
  UserFavorite,
  FavoriteWithMediaDetails,
} from "../models/FavoriteModel";

export class FavoriteService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async addToFavorites(userId: string, mediaId: string): Promise<void> {
    const favoritesCollection = this.fastify.mongo.db!.collection("favorites");
    const mediaCollection = this.fastify.mongo.db!.collection("media");

    if (!ObjectId.isValid(mediaId)) {
      throw new Error("MEDIA_NOT_FOUND");
    }

    const mediaExists = await mediaCollection.findOne({
      _id: new ObjectId(mediaId),
    });
    if (!mediaExists) {
      throw new Error("MEDIA_NOT_FOUND");
    }

    const existingFavorite = await favoritesCollection.findOne({
      userId,
      mediaId,
    });

    if (existingFavorite) {
      return;
    }

    await favoritesCollection.insertOne({
      userId,
      mediaId,
      addedAt: new Date(),
    });
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithMediaDetails[]> {
    const favoritesCollection = this.fastify.mongo.db!.collection("favorites");

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
  }

  async removeFromFavorites(userId: string, mediaId: string): Promise<boolean> {
    const favoritesCollection = this.fastify.mongo.db!.collection("favorites");

    const result = await favoritesCollection.deleteOne({
      userId,
      mediaId,
    });

    return result.deletedCount > 0;
  }

  async isFavorite(userId: string, mediaId: string): Promise<boolean> {
    const favoritesCollection = this.fastify.mongo.db!.collection("favorites");

    const favorite = await favoritesCollection.findOne({
      userId,
      mediaId,
    });

    return !!favorite;
  }
}
