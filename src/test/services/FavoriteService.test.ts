import { FavoriteService } from "../../services/FavoriteService";

const mockFastify = {
  mongo: {
    db: {
      collection: jest.fn(),
    },
  },
};

describe("FavoriteService", () => {
  it("should create FavoriteService instance", () => {
    const favoriteService = new FavoriteService(mockFastify as any);
    expect(favoriteService).toBeInstanceOf(FavoriteService);
  });
});
