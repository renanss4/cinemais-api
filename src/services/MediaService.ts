import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { Media, CreateMediaRequest } from "../models/MediaModel";
import { AppError } from "../utils/errors";

export class MediaService {
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

  async createMedia(mediaData: CreateMediaRequest): Promise<Media> {
    const mediaCollection = this.getCollection("media");

    const newMedia = {
      ...mediaData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingMedia = await mediaCollection.findOne({
      title: newMedia.title,
    });
    if (existingMedia) {
      throw new AppError("Media with this title already exists", 400);
    }

    const result = await mediaCollection.insertOne(newMedia);

    const insertedMedia = await mediaCollection.findOne({
      _id: result.insertedId,
    });

    if (!insertedMedia) {
      throw new AppError("Failed to create media", 500);
    }

    return {
      id: insertedMedia._id.toString(),
      title: insertedMedia.title,
      description: insertedMedia.description,
      type: insertedMedia.type,
      releaseYear: insertedMedia.releaseYear,
      genre: insertedMedia.genre,
      createdAt: insertedMedia.createdAt,
      updatedAt: insertedMedia.updatedAt,
    };
  }

  async getAllMedia(): Promise<Media[]> {
    const mediaCollection = this.getCollection("media");
    const medias = await mediaCollection.find({}).toArray();

    return medias.map((media) => ({
      id: media._id.toString(),
      title: media.title,
      description: media.description,
      type: media.type,
      releaseYear: media.releaseYear,
      genre: media.genre,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    }));
  }

  async getMediaById(id: string): Promise<Media> {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new AppError("Invalid media ID", 400);
    }

    if (!ObjectId.isValid(id)) {
      throw new AppError("Invalid media ID", 400);
    }

    const mediaCollection = this.getCollection("media");
    const media = await mediaCollection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      throw new AppError("Media not found", 404);
    }

    return {
      id: media._id.toString(),
      title: media.title,
      description: media.description,
      type: media.type,
      releaseYear: media.releaseYear,
      genre: media.genre,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }
}
