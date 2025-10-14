// Modul 2
import { initMongoDB } from "./db/initMongoDB.js";
import { startServer } from "./server.js";

async function bootStrap() {
  await initMongoDB();
  startServer();
}

bootStrap();
