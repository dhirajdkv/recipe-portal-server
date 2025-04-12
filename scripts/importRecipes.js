import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe.js';

dotenv.config();

async function importRecipes() {
  try {
    // Connecting to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'utils', 'full_stack_project_grocery_list.csv');

    // Object to store recipes grouped by name
    const recipesMap = {};

    // Create a promise to handle the CSV processing
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Skipping header row if it exists
          if (row['Dish name'] === 'Dish name') return;

          const recipeName = row['Dish name']?.trim();
          const ingredientName = row['Ingredients']?.trim();
          
          // Skipping if recipe name or ingredient name is missing
          if (!recipeName || !ingredientName) return;

          // Handling quantity - convert to number if present, otherwise null
          let quantity = null;
          if (row['Quantity'] && row['Quantity'].trim() !== '') {
            quantity = parseFloat(row['Quantity']);
            if (isNaN(quantity)) quantity = null;
          }

          // Handling unit - use empty string if not present
          const unit = row['Unit of Measure']?.trim() || '';
          
          const ingredient = {
            name: ingredientName,
            quantity: quantity,
            unit: unit
          };

          // Grouping ingredients by recipe
          if (!recipesMap[recipeName]) {
            recipesMap[recipeName] = {
              name: recipeName,
              ingredients: []
            };
          }
          
          recipesMap[recipeName].ingredients.push(ingredient);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error processing CSV file:', error);
          reject(error);
        });
    });

    const recipes = Object.values(recipesMap);
    console.log(`Found ${recipes.length} unique recipes`);
    
    const result = await Recipe.insertMany(recipes);
    console.log(`Successfully inserted ${result.length} recipes into MongoDB`);

    if (result.length > 0) {
      console.log('\nSample recipe:');
      console.log(JSON.stringify(result[0], null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the import function
importRecipes(); 