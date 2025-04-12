import express from 'express';
import cors from 'cors';
import recipeRoutes from './routes/recipeRoutes.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/recipes', recipeRoutes);

// Health check route
app.get('/', (req, res) => res.send('API up and running'));

export default app; 