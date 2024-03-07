const mongoose = require('mongoose');

const emissionSchema = new mongoose.Schema({
  selectedName: String,
  selectedCategory: String,
  selectedCountry: String,
  selectedType: String,
  selectedBrand: String,
  distance: String,
  description: String,
  group: String,
  sku: String,
  unit: String,
  consumption: String,
  emission: String,
  date: String,
  result: String,
});

const EmissionData = mongoose.model('EmissionData', emissionSchema);

module.exports = EmissionData;
