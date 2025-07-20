import { MediaService } from "../../services/MediaService";

const mockFastify = {
  mongo: {
    db: {
      collection: jest.fn(),
    },
  },
};

describe("MediaService", () => {
  it("should create MediaService instance", () => {
    const mediaService = new MediaService(mockFastify as any);
    expect(mediaService).toBeInstanceOf(MediaService);
  });
});
