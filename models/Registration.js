const mongoose = require('mongoose');

// Create a schema for ISN Registration
const isnRegistrationSchema = new mongoose.Schema({
  propertyName: String,
  propertyType: String,
  location: String,
  address: String,
  website: String,
  numberOfKeys: Number,
  contactPerson: String,
  mobileNumber: String,
  email: String,
  sustainabilityPrograms: String,
  loginPin: String, // Save login PIN as a string
});

// Create a model for ISN Registration
const Registration = mongoose.model('Registration', isnRegistrationSchema);

module.exports = Registration;
