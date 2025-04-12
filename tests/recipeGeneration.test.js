import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import Recipe from '../models/Recipe.js';
import * as dbHandler from './db-handler.js';

// Connect to the database before tests
beforeAll(async () => await dbHandler.connect());

// Clear test data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests
afterAll(async () => await dbHandler.closeDatabase());

describe('Recipe API', () => {
  describe('POST /api/recipes/generate', () => {
    it('should return 400 if recipe name already exists', async () => {
      // Create a recipe first
      await Recipe.create({
        name: 'Existing Recipe',
        ingredients: [{ name: 'Test', quantity: 1, unit: 'g' }]
      });
      
      // Try to generate with the same name
      const res = await request(app)
        .post('/api/recipes/generate')
        .send({ name: 'Existing Recipe' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Recipe with this name already exists');
    });
    
    it('should return 400 if no recipe name provided', async () => {
      const res = await request(app)
        .post('/api/recipes/generate')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Recipe name is required');
    });
  });
}); 