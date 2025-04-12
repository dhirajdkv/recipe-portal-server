import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import recipeRoutes from './routes/recipeRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => res.send('API up and runninggg'));

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});
