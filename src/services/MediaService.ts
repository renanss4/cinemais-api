import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { Media, CreateMediaRequest } from "../models/MediaModel";
import { NotFoundError, ServerError } from "../utils/errors";

export class MediaService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async createMedia(mediaData: CreateMediaRequest): Promise<Media> {
    try {
      const mediaCollection = this.fastify.mongo.db!.collection("media");

      const newMedia = {
        ...mediaData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await mediaCollection.insertOne(newMedia);

      const insertedMedia = await mediaCollection.findOne({
        _id: result.insertedId,
      });

      if (!insertedMedia) {
        throw new ServerError("Failed to create media");
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
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }
      throw new ServerError("Failed to create media");
    }
  }

  async getAllMedia(): Promise<Media[]> {
    try {
      const mediaCollection = this.fastify.mongo.db!.collection("media");
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
    } catch (error) {
      throw new ServerError("Failed to fetch media");
    }
  }

  async getMediaById(id: string): Promise<Media | null> {
    try {
      const mediaCollection = this.fastify.mongo.db!.collection("media");

      if (!ObjectId.isValid(id)) {
        throw new NotFoundError("Media");
      }

      const media = await mediaCollection.findOne({ _id: new ObjectId(id) });

      if (!media) {
        throw new NotFoundError("Media");
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
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError("Failed to fetch media");
    }
  }
}
