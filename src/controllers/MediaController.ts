import { FastifyRequest, FastifyReply } from "fastify";
import { MediaService } from "../services/MediaService";
import { CreateMediaRequest } from "../models/MediaModel";
import { validateCreateMediaRequest } from "../utils/validators";

export class MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async createMedia(
    request: FastifyRequest<{ Body: CreateMediaRequest }>,
    reply: FastifyReply
  ) {
    try {
      const validationError = validateCreateMediaRequest(request.body);
      if (validationError) {
        return reply.status(400).send({ message: validationError });
      }

      const media = await this.mediaService.createMedia(request.body);

      return reply.status(201).send(media);
    } catch (error) {
      console.error("Error creating media:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getAllMedia(request: FastifyRequest, reply: FastifyReply) {
    try {
      const medias = await this.mediaService.getAllMedia();

      if (medias.length === 0) {
        return reply.status(404).send({ message: "No media found" });
      }

      return reply.status(200).send(medias);
    } catch (error) {
      console.error("Error fetching media:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getMediaById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const media = await this.mediaService.getMediaById(id);

      if (!media) {
        return reply.status(404).send({ message: "Media not found" });
      }

      return reply.status(200).send(media);
    } catch (error) {
      console.error("Error fetching media by ID:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
