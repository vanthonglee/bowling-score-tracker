// backend/index.ts
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

// Security: Configure CORS to allow requests only from the frontend
app.use(cors({ origin: process.env.FRONTEND_URL }));

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
  if (err instanceof ApiError) {
    console.error(`API Error [${err.status}]: ${err.message}`);
    res.status(err.status).json({ error: err.message });
  } else {
    console.error('Unexpected Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));