const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
    Name: String,
    Category: String,
    Description: String,
    Group: String,
    Country: String,
    Brand: String,
    SKU: String,
    Type: String,
    Unit: String,
    Emission: Number,
    dynamicFields: Object,  // Dynamic field to store additional data
    mainCategory: String,   // New field for main category
});

const Ghgdata = mongoose.model('Ghgdata', dataSchema);

module.exports = Ghgdata;
