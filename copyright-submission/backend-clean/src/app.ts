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
import { securityMiddleware, securityHeaders, loginRateLimiter } from './middleware/security';
import routes from './routes';
import { logger } from './utils/logger'에러가 발생했습니다'trust proxy'에러가 발생했습니다'http://localhost:5173'에러가 발생했습니다'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'에러가 발생했습니다'http://localhost:5173').split(','에러가 발생했습니다'10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  // HTTP request logging only in development
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    // In production, log only errors
    app.use(morgan('combined'에러가 발생했습니다'/api/', rateLimiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api'에러가 발생했습니다'connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);

    socket.on('join-room'에러가 발생했습니다'leave-room'에러가 발생했습니다'disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return { app, io, httpServer };
};