import { FastifyRequest, FastifyReply } from "fastify";
import { FavoriteService } from "../services/FavoriteService";
import { AddToFavoritesRequest } from "../models/FavoriteModel";
import { validateId } from "../utils/validators";
import { ValidationError } from "../utils/errors";

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
    const { userId } = request.params;
    const { mediaId } = request.body;

    const userIdError = validateId(userId);
    if (userIdError) {
      throw new ValidationError(userIdError);
    }

    const mediaIdError = validateId(mediaId);
    if (mediaIdError) {
      throw new ValidationError(mediaIdError);
    }

    await this.favoriteService.addToFavorites(userId, mediaId);
    return reply.status(204).send();
  }

  async getFavoritesByUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    const { userId } = request.params;

    const userIdError = validateId(userId);
    if (userIdError) {
      throw new ValidationError(userIdError);
    }

    const favorites = await this.favoriteService.getUserFavorites(userId);
    return reply.status(200).send(favorites);
  }

  async removeFromFavorites(
    request: FastifyRequest<{
      Params: { userId: string; mediaId: string };
    }>,
    reply: FastifyReply
  ) {
    const { userId, mediaId } = request.params;

    const userIdError = validateId(userId);
    if (userIdError) {
      throw new ValidationError(userIdError);
    }

    const mediaIdError = validateId(mediaId);
    if (mediaIdError) {
      throw new ValidationError(mediaIdError);
    }

    await this.favoriteService.removeFromFavorites(userId, mediaId);
    return reply.status(204).send();
  }
}
