# Recipe Portal Server

A RESTful API server for managing recipes and creating consolidated grocery lists.

## Features

- Search recipes by name
- Get recipe details by ID
- Generate consolidated grocery lists from multiple recipes
- Generate new recipes using AI
- Intelligent ingredient consolidation with fuzzy matching

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file in the root directory with the following:
```
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

- **GET /api/recipes/search** - Search recipes by name
- **GET /api/recipes/:id** - Get recipe details by ID
- **POST /api/recipes/generate** - Generate a new recipe using AI
- **POST /api/recipes/consolidated-list** - Get consolidated grocery list from multiple recipes

## Testing

Run the tests:
```
npm test
```

Run tests in watch mode:
```
npm run test:watch
```

## Ingredient Consolidation

The API uses fuzzy matching to consolidate similar ingredients in the grocery list. Ingredients with a similarity score above 0.6 (60%) are considered the same ingredient, which helps to avoid duplicates like "Red Chilli Powder" and "Red Chili Powder".