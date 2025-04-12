// Units to be removed from ingredient names
export const unitsToRemove = ['tbsp', 'tsp', 'cup', 'cups', 'lb', 'lbs', 'kg', 'g', 'oz', 'bunch', 'pieces', 'piece', 'pcs', 'pc'];

// Common ingredient name substitutions
export const ingredientSubstitutions = {
  // Dals and Lentils
  'urad dal': 'urad dal',
  'urad daal': 'urad dal',
  'urud dal': 'urad dal',
  'urud daal': 'urad dal',
  'split black gram lentils': 'urad dal',
  'black gram dal': 'urad dal',
  'black gram': 'urad dal',
  'toor dal': 'toor dal',
  'toor daal': 'toor dal',
  'tur dal': 'toor dal',
  'arhar dal': 'toor dal',
  'pigeon pea lentils': 'toor dal',
  
  // Herbs and Spices
  'cilantro': 'coriander',
  'fresh coriander': 'coriander',
  'coriander powder': 'coriander ground',
  'coriander seeds': 'coriander whole',
  'dhania powder': 'coriander ground',
  'dhania seeds': 'coriander whole',
  'green chili': 'green chilli',
  'green chilies': 'green chilli',
  'green chilis': 'green chilli',
  'green chilles': 'green chilli',
  'hari mirch': 'green chilli',
  
  // Oils and Fats
  'cooking oil': 'oil',
  'vegetable oil': 'oil',
  'refined oil': 'oil',
  'sunflower oil': 'oil',
  'canola oil': 'oil',
  
  // Spices and Seasonings
  'cumin seeds': 'cumin whole',
  'cumin powder': 'cumin ground',
  'cumin jeera': 'cumin whole',
  'jeera': 'cumin whole',
  'jeera powder': 'cumin ground',
  'methi': 'fenugreek',
  'kasuri methi': 'dried fenugreek leaves',
  'dried methi': 'dried fenugreek leaves',
  'garam masala powder': 'garam masala',
  'black pepper powder': 'black pepper ground',
  'kali mirch powder': 'black pepper ground',
  'black pepper': 'black pepper whole',
  'kali mirch': 'black pepper whole',
  'red chilli powder': 'red chilli ground',
  'lal mirch powder': 'red chilli ground',
  'turmeric powder': 'turmeric ground',
  'haldi': 'turmeric ground',
  
  // Vegetables and Produce
  'onions': 'onion',
  'pyaaz': 'onion',
  'tomatoes': 'tomato',
  'tamatar': 'tomato',
  'potatoes': 'potato',
  'aloo': 'potato',
  'garlic': 'garlic',
  'lahsun': 'garlic',
  'ginger': 'ginger',
  'adrak': 'ginger',
  'capsicum': 'bell pepper',
  'shimla mirch': 'bell pepper',
  
  // Dairy and alternatives
  'dahi': 'yogurt',
  'yoghurt': 'yogurt',
  'curd': 'yogurt',
  'paneer': 'cottage cheese',
  'cottage cheese': 'paneer',
  
  // Grains and Flours
  'atta': 'wheat flour',
  'whole wheat flour': 'wheat flour',
  'maida': 'all purpose flour',
  'all-purpose flour': 'all purpose flour',
  'besan': 'gram flour',
  'chickpea flour': 'gram flour',
  'rice': 'rice',
  'chawal': 'rice',
  'basmati rice': 'rice basmati',
  'basmati chawal': 'rice basmati'
};

// Function to normalize ingredient names
export const normalizeIngredientName = (name) => {
  // Convert to lowercase and trim
  let normalized = name.toLowerCase().trim();
  
  // Remove units from name
  unitsToRemove.forEach(unit => {
    normalized = normalized.replace(new RegExp(`\\s*${unit}\\s*`, 'g'), ' ');
  });

  // Apply substitutions - exact match first
  if (ingredientSubstitutions[normalized]) {
    normalized = ingredientSubstitutions[normalized];
  } else {
    // Try matching without parenthetical content
    const withoutParens = normalized.replace(/\s*\([^)]*\)/g, '').trim();
    if (ingredientSubstitutions[withoutParens]) {
      normalized = ingredientSubstitutions[withoutParens];
    } else {
      // Remove plurals only if no substitution was found
      normalized = normalized
        .replace(/(\w+)ies$/, '$1y')  // berries -> berry
        .replace(/(\w+)s$/, '$1')     // potatoes -> potato
        .trim();
    }
  }

  return normalized;
}; 