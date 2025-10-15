import { initMongoDB } from "./db/initMongoDB.js";
import { setupServer } from "./server.js";

async function startApp() {
  await initMongoDB();
  setupServer();
}

startApp();
