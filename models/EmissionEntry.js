// EmissionEntry.js
const mongoose = require('mongoose');

const emissionEntrySchema = new mongoose.Schema({
  adminId: { type: String, required: true },
  username: { type: String, required: true },
  transactionType: { type: String, required: true },
  pickup: String,
  drop: String,
  transportMode: String,
  vehicle: String,
  weightKg: Number,
  distanceKm: Number,
  emissionFactor: Number,
  emission: Number,
  packMaterial: String,
  packWeightKg: Number,
  packFactor: Number,
  packEmission: Number,
  createdAt: { type: Date, default: Date.now },
});

const EmissionEntry = mongoose.model('EmissionEntry', emissionEntrySchema);

module.exports = EmissionEntry;
