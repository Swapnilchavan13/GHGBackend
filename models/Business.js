const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true }, // business login username
  password: { type: String, required: true }, // business login password
});

module.exports = mongoose.model('Business', BusinessSchema);
