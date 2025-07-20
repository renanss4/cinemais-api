import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { MediaService } from "../services/MediaService";
import { MediaController } from "../controllers/MediaController";
import { CreateMediaRequest } from "../models/MediaModel";

export async function mediaRoutes(fastify: FastifyInstance) {
  const mediaService = new MediaService(fastify);
  const mediaController = new MediaController(mediaService);

  fastify.post<{ Body: CreateMediaRequest }>(
    "/media",
    async (
      request: FastifyRequest<{ Body: CreateMediaRequest }>,
      reply: FastifyReply
    ) => {
      return mediaController.createMedia(request, reply);
    }
  );

  fastify.get(
    "/media",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return mediaController.getAllMedia(request, reply);
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/media/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      return mediaController.getMediaById(request, reply);
    }
  );
}
