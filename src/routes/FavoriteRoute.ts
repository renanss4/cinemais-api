import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FavoriteService } from "../services/FavoriteService";
import { FavoriteController } from "../controllers/FavoriteController";
import { AddToFavoritesRequest } from "../models/FavoriteModel";

export async function favoriteRoute(fastify: FastifyInstance) {
  const favoriteService = new FavoriteService(fastify);
  const favoriteController = new FavoriteController(favoriteService);

  fastify.post<{
    Params: { userId: string };
    Body: AddToFavoritesRequest;
  }>(
    "/users/:userId/favorites",
    async (
      request: FastifyRequest<{
        Params: { userId: string };
        Body: AddToFavoritesRequest;
      }>,
      reply: FastifyReply
    ) => {
      return favoriteController.addToFavorites(request, reply);
    }
  );

  fastify.get<{ Params: { userId: string } }>(
    "/users/:userId/favorites",
    async (
      request: FastifyRequest<{ Params: { userId: string } }>,
      reply: FastifyReply
    ) => {
      return favoriteController.getFavoritesByUser(request, reply);
    }
  );

  fastify.delete<{ Params: { userId: string; mediaId: string } }>(
    "/users/:userId/favorites/:mediaId",
    async (
      request: FastifyRequest<{ Params: { userId: string; mediaId: string } }>,
      reply: FastifyReply
    ) => {
      return favoriteController.removeFromFavorites(request, reply);
    }
  );
}
