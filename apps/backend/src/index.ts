// apps/backend/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import gameRoutes from './routes/gameRoutes';
import { ApiError } from './types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: '*', // Use wildcard for now to rule out origin issues
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  })
);

// Handle preflight OPTIONS requests
app.options('*', (req: Request, res: Response) => {
  try {
    console.log('Handling OPTIONS request for:', req.url);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', req.headers);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(204).send();
  } catch (error) {
    console.error('Error in OPTIONS handler:', error);
    res.status(500).send('Internal Server Error in OPTIONS');
  }
});

// Security: Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 2 * 60 * 60 * 1000, // 2 hours
  max: 1000, // Limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Mount game routes
app.use('/api/game', gameRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error in request to ${req.url}:`, err);
  if (err instanceof ApiError) {
    console.error(`API Error [${err.status}]: ${err.message}`);
    res.status(err.status).json({ error: err.message });
  } else {
    console.error('Unexpected Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the app for Vercel
export default app;