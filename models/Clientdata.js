const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  username: String,
  userId: String,
  password: String,
  logoimg: String,

});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
