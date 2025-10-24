// models/EmissionEntry.js
const mongoose = require("mongoose");

const emissionEntrySchema = new mongoose.Schema({
  // Admin/User metadata
  adminId: { type: String, required: true },
  username: { type: String, required: true },

  // Order-Level Information
  orderId: { type: String, required: true },
  orderDate: { type: Date, required: true },
  customerCity: String,
  customerState: String,
  customerCountry: String,
  customerPin: String,
  deliveryOption: String, // e.g. Standard / Express / Same-day / Eco-shipping
  paymentMethod: String,

  // Packaging Information
  packagingType: String, // e.g. Cardboard / Plastic / Compostable / etc.
  packagingWeightKg: Number,
  packagingUnits: Number,

  // Logistics & Delivery Information
  warehouseLocation: String,
  transportMode: String, // e.g. Air / Sea / Rail / Road / EV / Bicycle courier
  distanceKm: Number,

  // Returns & Reverse Logistics
  returnFlag: { type: Boolean, default: false },
  returnQuantity: Number,
  returnDistanceKm: Number,
  returnTransportMode: String,

  // Auto-Calculated / Derived Emission Fields
  productEmissionFactor: Number,
  packagingEmissionFactor: Number,
  transportEmissionFactor: Number,
  orderCarbonFootprint: Number, // total emission per order
  carbonIntensity: Number, // per unit or per kg

  // Audit
  createdAt: { type: Date, default: Date.now },
});

const EmissionEntry = mongoose.model("EmissionEntry", emissionEntrySchema);

module.exports = EmissionEntry;
