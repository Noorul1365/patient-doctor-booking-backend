const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String, 
    unique: true, 
    required: true,
    match: /.+\@.+\..+/ 
  },
  password: { 
    type: String, 
    required: true 
  },
});

module.exports = mongoose.model('Admin', adminSchema);
