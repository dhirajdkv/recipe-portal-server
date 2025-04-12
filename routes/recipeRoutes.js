import express from 'express';
import { searchRecipes, getRecipeById } from '../controllers/recipeController.js';

const router = express.Router();

// search recipes by name (returns only name and ID)
router.get('/search', searchRecipes);

// get a specific recipe by ID with all details
router.get('/:id', getRecipeById);

export default router; 