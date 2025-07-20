export interface Media {
  id: string;
  title: string;
  description: string;
  type: "movie" | "series";
  releaseYear: number;
  genre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaRequest {
  title: string;
  description: string;
  type: "movie" | "series";
  releaseYear: number;
  genre: string;
}
