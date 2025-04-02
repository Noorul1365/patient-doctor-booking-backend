const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Appointment", // assuming it references an Appointment model
    },
    patientId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "patients", // assuming it references a User model
    },
    doctorId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "doctors", // assuming it references a User model
    },
    message: {
      type: String,
    },
    // messages: [{
    //   text: {
    //     type: String,
    //     required: true
    //   },
    //   sender: {
    //     type: String,
    //     enum: ['patient', 'doctor'],
    //     required: true
    //   },
    //   date: {
    //     type: Date,
    //     default: Date.now
    //   }
    // }],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
