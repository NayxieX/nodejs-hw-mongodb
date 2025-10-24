import express from "express";
import pino from "pino-http";
import cors from "cors";
import dotenv from "dotenv";
import contactsRouter from "./routers/contacts.js";
import authRouter from "./routers/auth.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import { authenticate } from "./middlewares/authenticate.js";

dotenv.config();
const PORT = process.env.PORT || 3000;

export const setupServer = () => {
  const app = express();
  app.use(cookieParser());
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
    res.json({
      message: "hello world",
    });
  });

  app.use("/auth", authRouter);
  app.use("/contacts", authenticate, contactsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
