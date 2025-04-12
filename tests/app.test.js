import request from 'supertest';
import app from '../app.js';

describe('App', () => {
  it('should respond with API status on root path', async () => {
    const res = await request(app).get('/');
    
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API up and running');
  });
}); 