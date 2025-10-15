import express from "express";
import pino from "pino-http";
import cors from "cors";
import dotenv from "dotenv";
import {
  handleGetAllContacts,
  handleGetContactById,
} from "./controllers/contactsController.js";

dotenv.config();

export const setupServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: "pino-pretty",
      },
    })
  );

  app.get("/", (req, res) => {
    res.json({ message: "Hello world!" });
  });

  app.get("/contacts", handleGetAllContacts);
  app.get("/contacts/:contactId", handleGetContactById);

  app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
