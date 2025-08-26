const mongoose = require('mongoose');

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
  photo: String,    // single image
  video: String,    // single video
  document: String, // single document
  claimScoreView: String,
  registry: String,
  enteredTime: { type: Date, default: Date.now }
});



// Create a model for Carbon Projects
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
