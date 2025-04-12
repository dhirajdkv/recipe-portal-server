import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: false,
    default: null
  },
  unit: {
    type: String,
    required: false,
    default: ''
  }
});

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ingredients: [ingredientSchema]
}, {
  timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe; 