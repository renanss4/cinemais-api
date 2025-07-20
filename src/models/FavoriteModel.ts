export interface UserFavorite {
  id: string;
  userId: string;
  mediaId: string;
  addedAt: Date;
}

export interface AddToFavoritesRequest {
  mediaId: string;
}

export interface FavoriteWithMediaDetails {
  userId: string;
  mediaId: string;
  addedAt: Date;
  media: {
    id: string;
    title: string;
    description: string;
    type: "movie" | "series";
    releaseYear: number;
    genre: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
