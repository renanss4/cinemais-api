import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../models/UserModel";
import { validateCreateUserRequest, validateId } from "../utils/validators";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>,
    reply: FastifyReply
  ) {
    try {
      const validationError = validateCreateUserRequest(request.body);
      if (validationError) {
        return reply.status(400).send({ message: validationError });
      }

      const user = await this.userService.createUser(request.body);

      return reply.status(201).send(user);
    } catch (error) {
      console.error("Error creating user:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers();
      return reply.status(200).send(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const validationError = validateId(id);
      if (validationError) {
        return reply.status(400).send({ message: validationError });
      }

      const user = await this.userService.getUserById(id);

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

      return reply.status(200).send(user);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
