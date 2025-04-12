import express from 'express';
import { searchRecipes, getRecipeById, getConsolidatedList, generateRecipe } from '../controllers/recipeController.js';

const router = express.Router();

// search recipes by name (returns only name and ID)
router.get('/search', searchRecipes);

// get a specific recipe by ID with all details
router.get('/:id', getRecipeById);

// get consolidated grocery list from multiple recipes
router.post('/consolidated-list', getConsolidatedList);

// generate a new recipe using AI
router.post('/generate', generateRecipe);

export default router; 