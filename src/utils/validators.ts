import { CreateMediaRequest } from "../models/MediaModel";
import { AddToFavoritesRequest } from "../models/FavoriteModel";
import { CreateUserRequest } from "../models/UserModel";

export function validateCreateMediaRequest(
  data: CreateMediaRequest
): string | null {
  const { title, description, type, releaseYear, genre } = data;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return "Title is required and must be a valid string.";
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return "Description is required and must be a valid string.";
  }

  if (!type || (type !== "movie" && type !== "series")) {
    return 'Type must be "movie" or "series".';
  }

  if (
    !releaseYear ||
    typeof releaseYear !== "number" ||
    releaseYear < 1900 ||
    releaseYear > new Date().getFullYear() + 5
  ) {
    return (
      "Release year must be a valid number between 1900 and " +
      (new Date().getFullYear() + 5) +
      "."
    );
  }

  if (!genre || typeof genre !== "string" || genre.trim().length === 0) {
    return "Genre is required and must be a valid string.";
  }

  return null;
}

export function validateId(id: string): string | null {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return "ID is required and must be a valid string.";
  }

  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    return null;
  }

  if (id.trim().length < 3) {
    return "ID must be at least 3 characters long or be a valid ObjectId.";
  }

  return null;
}

export function validateCreateUserRequest(
  data: CreateUserRequest
): string | null {
  const { username, email, password } = data;

  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length === 0
  ) {
    return "Username is required and must be a valid string.";
  }

  if (username.trim().length < 3) {
    return "Username must be at least 3 characters long.";
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return "Email is required and must be a valid string.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email must be a valid email address.";
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    return "Password is required and must be a valid string.";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
}
