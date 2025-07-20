import { FastifyRequest, FastifyReply } from "fastify";
import { MediaService } from "../services/MediaService";
import { CreateMediaRequest } from "../models/MediaModel";
import { validateCreateMediaRequest, validateId } from "../utils/validators";
import { ValidationError } from "../utils/errors";

export class MediaController {
  private mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.mediaService = mediaService;
  }

  async createMedia(
    request: FastifyRequest<{ Body: CreateMediaRequest }>,
    reply: FastifyReply
  ) {
    const validationError = validateCreateMediaRequest(request.body);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const media = await this.mediaService.createMedia(request.body);
    return reply.status(201).send(media);
  }

  async getAllMedia(request: FastifyRequest, reply: FastifyReply) {
    const medias = await this.mediaService.getAllMedia();
    return reply.status(200).send(medias);
  }

  async getMediaById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;

    const validationError = validateId(id);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const media = await this.mediaService.getMediaById(id);
    return reply.status(200).send(media);
  }
}
