import convert from 'convert-units';

export const unitMappings = {
  // Volume units
  'cup': 'cup',
  'cups': 'cup',
  'tablespoon': 'Tbs',
  'tablespoons': 'Tbs',
  'tbsp': 'Tbs',
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'tsp': 'tsp',
  'ml': 'ml',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'millilitre': 'ml',
  'millilitres': 'ml',
  'liter': 'l',
  'liters': 'l',
  'litre': 'l',
  'litres': 'l',
  'l': 'l',
  
  // Mass units
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'kg': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'lb': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'oz': 'oz',
  'ounce': 'oz',
  'ounces': 'oz'
};

// Check if a unit is a volume unit
export const isVolumeUnit = (unit) => {
  const volumeUnits = ['cup', 'Tbs', 'tsp', 'ml', 'l'];
  const normalizedUnit = unitMappings[unit.toLowerCase().trim()];
  return normalizedUnit && volumeUnits.includes(normalizedUnit);
};

// Normalize and convert volume units
export const normalizeVolumeUnits = (ingredients) => {
  if (ingredients.length === 0) return ingredients;
  
  // Log the input ingredients for debugging
  console.log('Normalizing ingredients:', ingredients.map(i => `${i.name}: ${i.quantity} ${i.unit}`));
  
  let totalInTsp = 0;
  
  ingredients.forEach(ingredient => {
    try {
      const unit = unitMappings[ingredient.unit.toLowerCase().trim()];
      if (unit) {
        totalInTsp += convert(ingredient.quantity).from(unit).to('tsp');
      } else {
        totalInTsp += ingredient.quantity;
      }
    } catch (error) {
      console.warn(`Conversion error ----> ${ingredient.name}: ${error.message}`);
      totalInTsp += ingredient.quantity;
    }
  });
  
  console.log(`Total in tsp: ${totalInTsp}`);
  
  // cup > tbsp > tsp
  const result = [];
  
  if (totalInTsp >= 48) { // 1 cup = 48 tsp
    const cups = Math.floor(totalInTsp / 48);
    result.push({
      quantity: cups,
      unit: 'cup',
      isPrimary: true
    });
    totalInTsp -= cups * 48;
  }
  
  if (totalInTsp >= 3) { // 1 tbsp = 3 tsp
    const tbsp = Math.floor(totalInTsp / 3);
    result.push({
      quantity: tbsp,
      unit: 'tbsp',
      isPrimary: result.length === 0
    });
    totalInTsp -= tbsp * 3;
  }
  
  if (totalInTsp > 0) {
    // round to nearest 0.25 tsp
    const tsp = Math.round(totalInTsp * 4) / 4;
    if (tsp > 0) {
      result.push({
        quantity: tsp,
        unit: 'tsp',
        isPrimary: result.length === 0
      });
    }
  }
  
  console.log('Normalized result:', result);
  return result;
}; 