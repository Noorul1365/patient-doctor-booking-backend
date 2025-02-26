const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient',
    required: true 
  },
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Slot', 
    required: true 
  },
  appointmentDate: { // Date of the appointment
    type: Date, 
    required: true 
  },
  appointmentDay: {
    type: String,
    required: true
  },
  appointmentTime: { // Time of the appointment, Format: "HH:MM"
    type: String, 
    required: true 
  }, 
  isCanceled: { 
    type: Boolean, 
    default: false // Default to false, indicating the appointment is active
  },
  appointmentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
