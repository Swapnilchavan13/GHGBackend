const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  buyerName: String,
  buyerType: String,
  industry: String,
  country: String,
  companySize: String,
  contactPerson: String,
  designation: String,
  email: { type: String, lowercase: true },
  phone: String,
  linkedinOrWebsite: String,
  officeAddress: String,
  volumePurchased: String,
  purchasedFrom: String,
  projectLinks: String,
  frequency: String,
  priceRange: String,
  standardPreferred: String,
  projectTypePreference: String,
  geographyPreference: String,
  coBenefitInterests: String,
  purposeOfPurchase: String,
  buyerStatus: String,
  sourceOfInfo: String,
  registryRetirementReference: String,
  notes: String,
});

module.exports = mongoose.model("Buyer", buyerSchema);
