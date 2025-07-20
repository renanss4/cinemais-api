import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";

let mongod: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  client = new MongoClient(uri);
  await client.connect();
});

afterAll(async () => {
  if (client) {
    await client.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

export { client };
