const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const patientSchema = new mongoose.Schema({
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
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  age: {
    type: Number,
    required: true
  },
  phoneNumber : {
    type: Number,
    required: true
  },
  otp: {
    type: String
  }
});

// Hash password before saving
patientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords for login
patientSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Patient', patientSchema);
