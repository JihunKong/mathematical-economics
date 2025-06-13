import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { bigintSerializer, patchBigIntJSON } from './middleware/bigintSerializer';
import routes from './routes';
import { logger } from './utils/logger';

dotenv.config();

export const createApp = (): { app: Application; io: Server; httpServer: any } => {
  // Patch BigInt JSON serialization globally
  patchBigIntJSON();
  
  const app = express();
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  // Middleware
  app.use(helmet());
  app.use(bigintSerializer);
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
      // Allow requests with no origin (like curl or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked origin: ${origin}, allowed: ${allowedOrigins.join(', ')}`);
        callback(null, false);
      }
    },
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  // Rate limiting
  app.use('/api/', rateLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(errorHandler);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      logger.info(`Client ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      logger.info(`Client ${socket.id} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return { app, io, httpServer };
};