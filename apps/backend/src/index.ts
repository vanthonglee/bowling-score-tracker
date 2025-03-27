// index.ts
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import gameRoutes from './routes/gameRoutes';

// Initialize Express app
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Security: Configure CORS to allow requests only from the frontend
app.use(cors({ origin: 'http://localhost:3000' }));

// Security: Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 2 * 60 * 60 * 1000, // 2 hours
  max: 1000, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Mount game routes
app.use('/api/game', gameRoutes);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));