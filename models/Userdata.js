const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  clientId: String,
  username: String,
  userId: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
