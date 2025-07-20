import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/UserService";
import { UserController } from "../controllers/UserController";
import { CreateUserRequest } from "../models/UserModel";

export async function userRoutes(fastify: FastifyInstance) {
  const userService = new UserService(fastify);
  const userController = new UserController(userService);

  fastify.post<{ Body: CreateUserRequest }>(
    "/users",
    async (
      request: FastifyRequest<{ Body: CreateUserRequest }>,
      reply: FastifyReply
    ) => {
      return userController.createUser(request, reply);
    }
  );

  fastify.get(
    "/users",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return userController.getAllUsers(request, reply);
    }
  );

  fastify.get<{ Params: { id: string } }>(
    "/users/:id",
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      return userController.getUserById(request, reply);
    }
  );
}
