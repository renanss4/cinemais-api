import { UserService } from "../../services/UserService";

const mockFastify = {
  mongo: {
    db: {
      collection: jest.fn(),
    },
  },
};

describe("UserService", () => {
  it("should create UserService instance", () => {
    const userService = new UserService(mockFastify as any);
    expect(userService).toBeInstanceOf(UserService);
  });
});
