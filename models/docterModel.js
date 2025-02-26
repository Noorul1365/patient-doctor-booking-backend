const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const doctorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  specialization: { 
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
  password: {
    type: String,
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    match: /.+\@.+\..+/ 
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isBlocked:{
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  }
});

doctorSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
  
  // Method to compare password
doctorSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
