// EmissionData schema
const mongoose = require('mongoose');

const emissionSchema = new mongoose.Schema({
  Name: String,
  Category: String,
  Country: String,
  Type: String,
  Brand: String,
  Description: String,
  Group: String,
  SKU: String,
  Unit: String,
  Consumption: String,
  Emission: String,
});

const EmissionData = mongoose.model('EmissionData', emissionSchema);

module.exports = EmissionData;
