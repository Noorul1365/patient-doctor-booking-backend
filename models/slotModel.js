const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },
  dayOfWeek: {
    type: String, 
    required: true 
  }, // E.g., "Monday", "Tuesday"
  startTime: { // Format: "HH:MM" (e.g., "09:00")
    type: String, 
    required: true 
  }, 
  endTime: { // Format: "HH:MM" (e.g., "17:00")
    type: String, 
    required: true 
  },  
  isBooked: { // Indicates if the slot is booked
    type: Boolean,
    default: false
  },
  isDeleted: { 
    type: Boolean,
    default: false
  },
  Date: {
    type: Date,
    required: true
    // default: Date.now
    // default: () => new Date().toISOString() // Stores current date in ISO format
  },
//   createdBy: { // Reference to the admin who created the slot
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Admin', 
//     required: true
//   }, 
}, {
  timestamps: true,
});

module.exports = mongoose.model('Slot', slotSchema);
