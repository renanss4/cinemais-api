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
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    },
  });

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "MongoError" || error.name === "MongoServerError") {
    return reply.status(500).send({
      message: "Database operation failed",
      timestamp: new Date().toISOString(),
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      message: "Invalid request data",
      details: error.validation,
      timestamp: new Date().toISOString(),
    });
  }

  return reply.status(500).send({
    message: "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
}
