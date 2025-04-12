import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateRecipeIngredients = async (recipeName) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Give me an ingredient list (name, quantity, unit) for the Indian recipe "${recipeName}" for 8 servings in the following JSON format:
    {
      "ingredients": [
        {
          "name": "ingredient name",
          "quantity": number,
          "unit": "unit of measurement"
        }
      ]
    }
    
    Important guidelines:
    1. Use standard units (cups, tbsp, tsp, g, kg, lb)
    2. Ensure quantities are numbers, not strings
    3. Keep ingredient names simple and consistent
    4. Include all spices and seasonings
    5. Format must be valid JSON
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in the response');
    }
    
    const recipeData = JSON.parse(jsonMatch[0]);
    return recipeData.ingredients;
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw error;
  }
}; 