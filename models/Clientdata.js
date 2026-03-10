const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  contactNumber: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  organization: {
    type: String,
    required: true
  },

  sector: {
    type: String,
    required: true
  },

  website: {
    type: String
  },

  plan: {
    type: String,
    enum: ["Basic", "Professional", "Enterprise"],
    required: true
  },

  password: {
    type: String,
    required: true
  },

  logoimg: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;