import { FastifyRequest, FastifyReply } from "fastify";
import { FavoriteService } from "../services/FavoriteService";
import { AddToFavoritesRequest } from "../models/FavoriteModel";
import { validateId } from "../utils/validators";

export class FavoriteController {
  private favoriteService: FavoriteService;

  constructor(favoriteService: FavoriteService) {
    this.favoriteService = favoriteService;
  }

  async addToFavorites(
    request: FastifyRequest<{
      Params: { userId: string };
      Body: AddToFavoritesRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const { mediaId } = request.body;

      const userIdError = validateId(userId);
      if (userIdError) {
        return reply.status(400).send({ message: userIdError });
      }

      const mediaIdError = validateId(mediaId);
      if (mediaIdError) {
        return reply.status(400).send({ message: mediaIdError });
      }

      await this.favoriteService.addToFavorites(userId, mediaId);

      return reply.status(204).send();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getFavoritesByUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;

      const userIdError = validateId(userId);
      if (userIdError) {
        return reply.status(400).send({ message: userIdError });
      }

      const favorites = await this.favoriteService.getUserFavorites(userId);
      return reply.status(200).send(favorites);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async removeFromFavorites(
    request: FastifyRequest<{
      Params: { userId: string; mediaId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, mediaId } = request.params;

      const userIdError = validateId(userId);
      if (userIdError) {
        return reply.status(400).send({ message: userIdError });
      }

      const mediaIdError = validateId(mediaId);
      if (mediaIdError) {
        return reply.status(400).send({ message: mediaIdError });
      }

      const removed = await this.favoriteService.removeFromFavorites(
        userId,
        mediaId
      );

      return reply.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
