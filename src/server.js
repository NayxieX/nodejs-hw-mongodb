import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import dotenv from 'dotenv';
import contactsRouter from './routers/contacts.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
dotenv.config();
const PORT = process.env.PORT || 3000;
export const setupServer = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'hello world',
    });
  });

  app.use('/contacts', contactsRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};