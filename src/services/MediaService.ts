import { FastifyInstance } from "fastify";
import { ObjectId } from "mongodb";
import { Media, CreateMediaRequest } from "../models/MediaModel";

export class MediaService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async createMedia(mediaData: CreateMediaRequest): Promise<Media> {
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

    return {
      id: insertedMedia!._id.toString(),
      title: insertedMedia!.title,
      description: insertedMedia!.description,
      type: insertedMedia!.type,
      releaseYear: insertedMedia!.releaseYear,
      genre: insertedMedia!.genre,
      createdAt: insertedMedia!.createdAt,
      updatedAt: insertedMedia!.updatedAt,
    };
  }

  async getAllMedia(): Promise<Media[]> {
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
  }

  async getMediaById(id: string): Promise<Media | null> {
    const mediaCollection = this.fastify.mongo.db!.collection("media");

    if (!ObjectId.isValid(id)) {
      return null;
    }

    const media = await mediaCollection.findOne({ _id: new ObjectId(id) });

    if (!media) {
      return null;
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
