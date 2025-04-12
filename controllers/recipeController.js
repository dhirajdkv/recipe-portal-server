import Recipe from '../models/Recipe.js';
import { normalizeIngredientName } from '../utils/ingredientSubstitutions.js';
import { generateRecipeIngredients } from '../utils/geminiAI.js';

// Search recipes by name
export const searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Creating a case-insensitive regex pattern
    const searchPattern = new RegExp(query, 'i');
    
    // Finding recipes matching the pattern, limit to 5 results
    // Only return recipe name and ID, explicitly exclude other fields
    const recipes = await Recipe.find({ name: searchPattern }, { name: 1, _id: 1 })
      .limit(5);
    
    return res.status(200).json({
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific recipe by ID with all details
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Recipe ID is required' });
    }
    
    // Find the recipe by ID and return all details
    const recipe = await Recipe.findById(id)
      .select('name ingredients createdAt updatedAt');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    return res.status(200).json(recipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid recipe ID format' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get consolidated grocery list from multiple recipes
export const getConsolidatedList = async (req, res) => {
  try {
    const { recipeIds } = req.body;
    
    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ message: 'Valid array of recipe IDs is required' });
    }
    
    // Fetch all recipes with the given IDs
    const recipes = await Recipe.find({
      _id: { $in: recipeIds }
    }).select('ingredients');
    
    if (recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found with the provided IDs' });
    }
    
    // Create a map to store consolidated ingredients
    const consolidatedMap = new Map();
    
    // Process each recipe's ingredients
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const normalizedName = normalizeIngredientName(ingredient.name);
        // Normalize unit to lowercase and trim
        const normalizedUnit = ingredient.unit.toLowerCase().trim();
        const key = `${normalizedName}_${normalizedUnit}`;
        
        if (consolidatedMap.has(key)) {
          const existing = consolidatedMap.get(key);
          existing.quantity += ingredient.quantity || 0;
        } else {
          consolidatedMap.set(key, {
            name: ingredient.name,  // keeping original name for display
            quantity: ingredient.quantity || 0,
            unit: ingredient.unit,
            normalizedName  // adding normalized name for debugging
          });
        }
      });
    });
    
    // Convert map to array and sort by normalized name
    const consolidatedList = Array.from(consolidatedMap.values())
      .sort((a, b) => a.normalizedName.localeCompare(b.normalizedName))
      // Remove the normalizedName from the final output
      .map(({ normalizedName, ...rest }) => rest);
    
    return res.status(200).json({
      count: consolidatedList.length,
      ingredients: consolidatedList
    });
  } catch (error) {
    console.error('Error generating consolidated list:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid recipe ID format' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// Generate a new recipe using AI
export const generateRecipe = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Recipe name is required' });
    }

    // Check if recipe with this name already exists
    const existingRecipe = await Recipe.findOne({ name });
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe with this name already exists' });
    }

    // Generate ingredients using Gemini AI
    const ingredients = await generateRecipeIngredients(name);

    // Create new recipe
    const newRecipe = new Recipe({
      name,
      ingredients
    });

    // Save to database
    await newRecipe.save();

    return res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error generating recipe:', error);
    if (error.message.includes('No valid JSON')) {
      return res.status(500).json({ message: 'Failed to generate valid recipe data' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
}; 