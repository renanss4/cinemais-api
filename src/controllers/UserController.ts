import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/UserService";
import { CreateUserRequest } from "../models/UserModel";
import { validateCreateUserRequest, validateId } from "../utils/validators";
import { ValidationError } from "../utils/errors";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>,
    reply: FastifyReply
  ) {
    const validationError = validateCreateUserRequest(request.body);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const user = await this.userService.createUser(request.body);
    return reply.status(201).send(user);
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await this.userService.getAllUsers();
    return reply.status(200).send(users);
  }

  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    const { id } = request.params;

    const validationError = validateId(id);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const user = await this.userService.getUserById(id);
    return reply.status(200).send(user);
  }
}
