import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Recipe from '../models/Recipe.js';
import * as dbHandler from './db-handler.js';

// Test recipe data
const testRecipe1 = {
  name: 'Test Butter Chicken',
  ingredients: [
    { name: 'Chicken', quantity: 500, unit: 'g' },
    { name: 'Butter', quantity: 50, unit: 'g' },
    { name: 'Tomato', quantity: 200, unit: 'g' },
    { name: 'Red Chilli Powder', quantity: 1, unit: 'tsp' }
  ]
};

const testRecipe2 = {
  name: 'Test Palak Paneer',
  ingredients: [
    { name: 'Spinach', quantity: 500, unit: 'g' },
    { name: 'Paneer', quantity: 200, unit: 'g' },
    { name: 'Cream', quantity: 100, unit: 'ml' },
    { name: 'Red Chili Powder', quantity: 1, unit: 'tsp' }
  ]
};

// Connect to the database before tests
beforeAll(async () => await dbHandler.connect());

// Clear test data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Recipe API', () => {
  describe('GET /api/recipes/search', () => {
    beforeEach(async () => {
      await Recipe.create(testRecipe1);
      await Recipe.create(testRecipe2);
    });

    it('should search recipes by name', async () => {
      const res = await request(app)
        .get('/api/recipes/search?query=Butter');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.recipes.length).toBe(1);
      expect(res.body.recipes[0].name).toBe('Test Butter Chicken');
    });

    it('should return 400 if no query provided', async () => {
      const res = await request(app)
        .get('/api/recipes/search');
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Search query is required');
    });
  });

  describe('GET /api/recipes/:id', () => {
    let recipeId;

    beforeEach(async () => {
      const recipe = await Recipe.create(testRecipe1);
      recipeId = recipe._id.toString();
    });

    it('should get a recipe by ID', async () => {
      const res = await request(app)
        .get(`/api/recipes/${recipeId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Test Butter Chicken');
      expect(res.body.ingredients.length).toBe(4);
    });

    it('should return 404 if recipe not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Recipe not found');
    });
  });

  describe('POST /api/recipes/consolidated-list', () => {
    let recipeId1, recipeId2;

    beforeEach(async () => {
      const recipe1 = await Recipe.create(testRecipe1);
      const recipe2 = await Recipe.create(testRecipe2);
      recipeId1 = recipe1._id.toString();
      recipeId2 = recipe2._id.toString();
    });

    it('should consolidate ingredients from multiple recipes', async () => {
      const res = await request(app)
        .post('/api/recipes/consolidated-list')
        .send({ recipeIds: [recipeId1, recipeId2] });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.ingredients.length).toBeGreaterThan(0);
      
      // Find the red chili powder which should be consolidated
      const chiliPowder = res.body.ingredients.find(
        ing => ing.name === 'Red Chilli Powder' || ing.name === 'Red Chili Powder'
      );
      
      // Should consolidate the similar chili powder ingredients
      expect(chiliPowder).toBeDefined();
      expect(chiliPowder.quantity).toBe(2);
      expect(chiliPowder.unit).toBe('tsp');
    });

    it('should return 400 if no recipe IDs provided', async () => {
      const res = await request(app)
        .post('/api/recipes/consolidated-list')
        .send({ recipeIds: [] });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Valid array of recipe IDs is required');
    });
  });
}); 