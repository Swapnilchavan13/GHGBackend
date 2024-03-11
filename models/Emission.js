const mongoose = require('mongoose');

const emissionSchema = new mongoose.Schema({
  userId: String,
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
  date1: String,
  result: String,
  image: String,
});

const EmissionData = mongoose.model('EmissionData', emissionSchema);

module.exports = EmissionData;
