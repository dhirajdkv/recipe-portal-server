import Recipe from '../models/Recipe.js';
import { generateRecipeIngredients } from '../utils/geminiAI.js';
import { partial_ratio } from 'fuzzball';
import { isVolumeUnit, normalizeVolumeUnits } from '../utils/unitConversion.js';

// Search recipes by name
export const searchRecipes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchPattern = new RegExp(query, 'i');
    
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
    
    const recipes = await Recipe.find({
      _id: { $in: recipeIds }
    }).select('ingredients');
    
    if (recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found with the provided IDs' });
    }
    
    // Step 1: Collect all ingredients from all recipes
    const allIngredients = [];
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        allIngredients.push({
          name: ingredient.name,
          normalizedName: ingredient.name.toLowerCase().trim(),
          quantity: ingredient.quantity || 0,
          unit: ingredient.unit,
          normalizedUnit: ingredient.unit.toLowerCase().trim()
        });
      });
    });
    
    // Step 2: Group ingredients by unit for faster processing
    const ingredientsByUnit = {};
    allIngredients.forEach(ingredient => {
      if (!ingredientsByUnit[ingredient.normalizedUnit]) {
        ingredientsByUnit[ingredient.normalizedUnit] = [];
      }
      ingredientsByUnit[ingredient.normalizedUnit].push(ingredient);
    });
    
    // Step 3: Process each unit group separately
    const similarityThreshold = 0.75;
    const consolidatedIngredients = [];
    const volumeUnitsGroups = new Map();
    
    Object.values(ingredientsByUnit).forEach(unitGroup => {
      const processedIndices = new Set();
      
      for (let i = 0; i < unitGroup.length; i++) {
        if (processedIndices.has(i)) continue;
        
        const currentIngredient = unitGroup[i];
        const similarIngredients = [currentIngredient];
        processedIndices.add(i);
        
        // Find all similar ingredients in the same unit group
        for (let j = i + 1; j < unitGroup.length; j++) {
          if (processedIndices.has(j)) continue;
          
          const otherIngredient = unitGroup[j];
          const similarityScore = partial_ratio(
            currentIngredient.normalizedName,
            otherIngredient.normalizedName
          ) / 100;
          
          if (similarityScore >= similarityThreshold) {
            similarIngredients.push(otherIngredient);
            processedIndices.add(j);
          }
        }
        
        const consolidated = {
          name: currentIngredient.name,
          unit: currentIngredient.unit,
          quantity: 0
        };
        
        similarIngredients.forEach(ing => {
          consolidated.quantity += ing.quantity;
        });
        
        const unitKey = consolidated.unit.toLowerCase().trim();
        if (isVolumeUnit(unitKey)) {
          const nameKey = consolidated.name.toLowerCase().trim();
          if (!volumeUnitsGroups.has(nameKey)) {
            volumeUnitsGroups.set(nameKey, {
              name: consolidated.name,
              ingredients: []
            });
          }
          volumeUnitsGroups.get(nameKey).ingredients.push(consolidated);
        } else {
          consolidatedIngredients.push(consolidated);
        }
      }
    });
    
    // Step 4: Process volume units and normalize them
    volumeUnitsGroups.forEach(group => {
      const normalizedUnits = normalizeVolumeUnits(group.ingredients);
      
      if (normalizedUnits.length > 0) {
        const primaryUnit = normalizedUnits.find(u => u.isPrimary);
        consolidatedIngredients.push({
          name: group.name,
          quantity: primaryUnit.quantity,
          unit: primaryUnit.unit
        });
        
        normalizedUnits.filter(u => !u.isPrimary).forEach(additionalUnit => {
          consolidatedIngredients.push({
            name: `+ ${group.name}`,
            quantity: additionalUnit.quantity,
            unit: additionalUnit.unit
          });
        });
      }
    });
    
    // Sort final list by name
    const consolidatedList = consolidatedIngredients.sort((a, b) => 
      a.name.toLowerCase().localeCompare(b.name.toLowerCase())
    );
    
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

    const existingRecipe = await Recipe.findOne({ name });
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe with this name already exists' });
    }

    const ingredients = await generateRecipeIngredients(name);

    const newRecipe = new Recipe({
      name,
      ingredients
    });

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