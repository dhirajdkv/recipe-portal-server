import Recipe from '../models/Recipe.js';

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