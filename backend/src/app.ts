import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { bigintSerializer, patchBigIntJSON } from './middleware/bigintSerializer';
import { securityMiddleware, securityHeaders, loginRateLimiter } from './middleware/security';
import routes from './routes';
import { logger } from './utils/logger';

dotenv.config();

export const createApp = (): { app: Application; io: Server; httpServer: any } => {
  // Patch BigInt JSON serialization globally
  patchBigIntJSON();
  
  const app = express();
  
  // Trust proxy (for rate limiter behind nginx)
  app.set('trust proxy', 1);
  
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  // Security headers
  app.use(securityHeaders);
  
  // Helmet with custom configuration
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
  
  app.use(bigintSerializer);
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
      // Allow requests with no origin (like curl or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  // HTTP request logging only in development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    // In production, log only errors
    app.use(morgan('combined', { 
      stream: { write: (message) => logger.info(message.trim()) },
      skip: (_req, res) => res.statusCode < 400
    }));
  }

  // Security middleware (suspicious activity detection)
  app.use(securityMiddleware);
  
  // Rate limiting
  app.use('/api/', rateLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', routes);

  // Serve static files for frontend (when SERVE_STATIC is enabled)
  if (process.env.SERVE_STATIC === 'true') {
    const publicPath = path.join(__dirname, '..', 'public');
    app.use(express.static(publicPath));

    // SPA fallback - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });

    logger.info(`Serving static files from: ${publicPath}`);
  }

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