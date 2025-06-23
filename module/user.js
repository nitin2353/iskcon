const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: String,
  image: String,
  phone: String,
  password: String,
  date: Date,
  count: Number,
  mala_count: Number,
  total_mala: Number
});


module.exports = mongoose.model('youth', userSchema); 
