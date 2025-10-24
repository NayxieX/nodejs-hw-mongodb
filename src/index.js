import { setupServer } from "./server.js";
import { initMongoDB } from "./db/initMongoDB.js";

const startApp = async () => {
  await initMongoDB();
  setupServer();
};

startApp();

export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};
