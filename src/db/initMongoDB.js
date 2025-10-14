import mongoose from "mongoose";
import { getEnvVar } from "../utils/getEnvVar.js";

export async function initMongoDB() {
  try {
    const user = getEnvVar("MONGODB_USER");
    const pwd = getEnvVar("MONGODB_PASSWORD");
    const url = getEnvVar("MONGODB_URL");
    const db = getEnvVar("MONGODB_DB");

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`
    );
    console.log("MongoDB connected successful");
  } catch (err) {
    console.log("Error to connect MongoDB: ", err);
    throw err;
  }
}
