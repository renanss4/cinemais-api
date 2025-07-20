import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { AppError } from "../utils/errors";

export async function errorHandler(
  error: (FastifyError & AppError) | { name: string; [key: string]: any },
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.error({
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    },
  });

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: true,
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "MongoError" || error.name === "MongoServerError") {
    return reply.status(500).send({
      error: true,
      code: "DATABASE_ERROR",
      message: "Database operation failed",
      timestamp: new Date().toISOString(),
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: true,
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: error.validation,
      timestamp: new Date().toISOString(),
    });
  }

  return reply.status(500).send({
    error: true,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
}
