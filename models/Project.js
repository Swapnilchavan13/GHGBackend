const mongoose = require('mongoose');

// Create a schema for Carbon Projects
const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: String,
  projectType: String,
  location: String,
  methodology: String,
  rating: String,
  price: { type: Number, required: true },
  quantity: Number,
  coBenefits: String,
  verification: String,
  featured: { type: Boolean, default: false },
  enteredTime: { type: Date, default: Date.now } // Auto timestamp
});

// Create a model for Carbon Projects
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
