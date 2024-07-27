const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Price must be a positive number'] 
  },
  description: { type: String, required: true },
  rating: { 
    type: Number, 
    required: true, 
    min: [0, 'Rating must be between 0 and 5'], 
    max: [5, 'Rating must be between 0 and 5'] 
  },
  category: { type: String, required: true },
  quantity: { 
    type: Number, 
    required: true, 
    min: [0, 'Quantity must be a positive number'] 
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
