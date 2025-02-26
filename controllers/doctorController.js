const bcrypt = require('bcrypt');
const Doctor = require('../models/docterModel');
const Slot = require('../models/slotModel');
const { sendDoctorCredentials } = require('../utils/emailService');
const { sendOtpEmail } = require('../utils/doctorEmail');
const Appointment = require('../models/appointmentModel');
const jwt = require('jsonwebtoken');
require('dotenv').config()

// Generate random password
const generateRandomPassword = () => Math.random().toString(36).slice(-8);

// Admin: Create Doctor
const createDoctor = async (req, res) => {
  const { name, email, specialization, gender, age } = req.body;

  try {
    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor already exists' });
    }

    // Generate a random password
    const password = generateRandomPassword();
    // password hash in model
    //const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    doctor = new Doctor({
      name,
      email,
      password, //: hashedPassword,
      //password: passwordStr,
      specialization,
      gender,
      age
    });

    await doctor.save();

    // Send password to doctor's email
    await sendDoctorCredentials(email, password);
    console.log(password);
    res.status(201).json({ message: 'Doctor created and credentials sent to email' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Doctor Login
const loginDoctor = async (req, res) => {
  const { email, password } = req.body; 

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if entered password matches hashed password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ doctorId: doctor._id }, process.env.DOCTER_JWT_SECRET, { expiresIn: '5h' });
    res.json({ message: 'Doctor logged in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const createSlot = async (req, res) => {
    const { doctorId, dayOfWeek, startTime, endTime } = req.body;
  
    try {
      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Create new slot
      const newSlot = new Slot({
        doctor: doctorId,
        dayOfWeek,
        startTime,
        endTime,
      });
  
      await newSlot.save();
      res.status(201).json({ message: 'Slot created successfully', slot: newSlot });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const deleteSlot = async (req, res) => {
  const { slotId } = req.params;

  try {
    const slot = await Slot.findOne({ _id: slotId, isDeleted: false });
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found or already deleted.' });
    }

    // Soft delete the slot
    slot.isDeleted = true;
    await slot.save();

    // Soft delete associated appointments
    await Appointment.updateMany(
      { slot: slotId, isDeleted: false },
      { $set: { isCanceled: true } }
    );

    res.status(200).json({ message: 'Slot and associated appointments softly deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const updateSlot = async (req, res) => {
  const { slotId } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;

  try {
    // Slot ko dhoondh rahe hain
    const slot = await Slot.findOne({ _id: slotId, isDeleted: false });
    if (!slot) {
      return res.status(404).json({ message: 'Slot is already deleted' });
    }

    // Check agar koi active appointment iss slot ke saath linked hai
    const activeAppointments = await Appointment.find({ slot: slotId, isDeleted: false });

    if (activeAppointments.length > 0) {
      // Agar slot already book hai, toh update nahi karenge
      return res.status(400).json({ message: 'slot is already booked, So update is not possible.' });
    }

    // Slot ke details update kar rahe hain
    slot.dayOfWeek = dayOfWeek || slot.dayOfWeek;
    slot.startTime = startTime || slot.startTime;
    slot.endTime = endTime || slot.endTime;

    await slot.save();
    res.status(200).json({ message: 'Slot updated successfully', slot });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const getAllDoctors = async (req, res) => {
    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const softDeleteDoctor = async (req, res) => {
    const { doctorId } = req.params; // Get doctorId from request parameters
  
    try {
      const doctor = await Doctor.findById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Mark the doctor as deleted
      doctor.isDeleted = true;
      await doctor.save();
  
      res.status(200).json({ message: 'Doctor soft deleted successfully', doctor });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const blockDoctor = async (req, res) => {
    const { doctorId } = req.params; // Get doctorId from request parameters
    const { isBlocked } = req.body;
  
    try {
        const doctor = await Doctor.findById(doctorId);
    
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
    
        // If the request is to block the doctor
        if (isBlocked) {
          // Check if the doctor is already blocked
          if (doctor.isBlocked) {
            return res.status(400).json({ message: 'Doctor is already blocked' });
          }
          
          // Block the doctor
          doctor.isBlocked = true;
        } else {
          return res.status(400).json({ message: 'Invalid request to block doctor' });
        }
    
        await doctor.save();
    
        res.status(200).json({ message: 'Doctor blocked successfully', doctor });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const unblockDoctor = async (req, res) => {
    const { doctorId } = req.params; // Get doctorId from request parameters
    const { isBlocked } = req.body;
  
    try {
        const doctor = await Doctor.findById(doctorId);
    
        if (!doctor) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
    
        // If the request is to unblock the doctor
        if (!isBlocked) {
          // Check if the doctor is already unblocked
          if (!doctor.isBlocked) {
            return res.status(400).json({ message: 'Doctor is already unblocked' });
          }
          
          // Unblock the doctor
          doctor.isBlocked = false;
        } else {
          return res.status(400).json({ message: 'Invalid request to unblock doctor' });
        }
    
        await doctor.save();
    
        res.status(200).json({ message: 'Doctor unblocked successfully', doctor });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { doctorId } = req.params; // Get doctorId from request parameters
    const { oldPassword, newPassword } = req.body; // Get old and new passwords from request body
  
    try {
      const doctor = await Doctor.findById(doctorId);
  
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Check if the old password matches
      const isMatch = await doctor.comparePassword(oldPassword);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      //const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the password
      // Update the password
      doctor.password = newPassword; // Ensure new password is hashed before saving
      await doctor.save();
  
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body; // Get email from request body
  
    try {
      const doctor = await Doctor.findOne({ email });
  
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Generate a 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
      // Send OTP to the doctor's email
      await sendOtpEmail(email, otp);
  
      // Store the OTP temporarily (e.g., in the session or in-memory store)
      // Here, we are just sending it back in response for simplicity
      // You might want to use a better approach for storing OTPs securely.
      doctor.otp = otp; // Save OTP to the doctor record or use a separate storage
      await doctor.save();
  
      res.status(200).json({ message: 'OTP sent to your email', otp });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const verifyOtpAndSetNewPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body; // Get email, OTP, and new password from request body
  
    try {
      const doctor = await Doctor.findOne({ email });
  
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      // Check if the OTP matches
      if (doctor.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Update the password
      doctor.password = newPassword; // Ensure new password is hashed before saving
      doctor.otp = undefined; // delete after use
      // doctor.otp = null; // Clear OTP after use
      await doctor.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const doctorId = req.doctor.id // Assuming `req.user.id` contains the logged-in doctor's ID from middleware

  try {
    // Find the appointment and verify it belongs to the doctor
    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctorId });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or unauthorized access' });
    }

    // Check if appointment is already canceled
    if (appointment.isCanceled) {
      return res.status(400).json({ message: 'Appointment is already canceled' });
    }

    // Mark the appointment as canceled
    appointment.isCanceled = true;
    await appointment.save();

    // Update the associated slot to make it available again
    await Slot.findByIdAndUpdate(appointment.slot, { isAvailable: true });

    res.status(200).json({ message: 'Appointment canceled successfully, slot is now available' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// controllers/appointmentController.js
const getDoctorAppointments = async (req, res) => {
  const doctorId = req.doctor.id; // Assuming req.doctor.id has the authenticated doctor's ID from the middleware

  try {
    // Find all appointments for the doctor that are not canceled
    const appointments = await Appointment.find({
      doctor: doctorId,
      isCanceled: false // Only fetch active appointments
    })
    .populate('patient') // Populate patient details if required
    .populate('slot'); // Optionally populate slot details

    // Check if there are no appointments
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found.' });
    }

    // Respond with the list of appointments
    res.status(200).json({
      message: 'Appointments fetched successfully',
      appointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // Assuming `doctorAuth` middleware sets `req.doctor.id`

    // Find all pending appointments for this doctor
    const pendingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentStatus: 'pending' // Assuming there is a 'status' field in Appointment model to track the status
    }).populate('patient') // populate patient details

    if (!pendingAppointments || pendingAppointments.length === 0) {
      return res.status(404).json({ message: 'No pending appointments found.' });
    }

    res.status(200).json({
      message: 'Pending appointments fetched successfully',
      appointments: pendingAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const getCompletedAppointments = async (req, res) => {
  try {
    const doctorId = req.doctor.id; // Assuming `doctorAuth` middleware sets `req.doctor.id`

    // Find all completed appointments for this doctor
    const completedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentStatus: 'completed' // Assuming 'status' field to track completion
    }).populate('patient') // populate patient details

    if (!completedAppointments || completedAppointments.length === 0) {
      return res.status(404).json({ message: 'No completed appointments found.' });
    }

    res.status(200).json({
      message: 'Completed appointments fetched successfully',
      appointments: completedAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const patientcompleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor.id; // Assuming `doctorAuth` middleware sets `req.doctor.id`

    // Find the appointment by ID and ensure it belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctor: doctorId,
      appointmentStatus: 'pending' // Only update if status is currently 'pending'
    });

    // Check if appointment exists and is pending
    if (!appointment) {
      return res.status(404).json({ message: 'Pending appointment not found or already completed.' });
    }

    // Update the appointment status to 'completed'
    appointment.appointmentStatus = 'completed';
    await appointment.save();

    res.status(200).json({ message: 'Appointment marked as completed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

module.exports = { 
    createDoctor, 
    loginDoctor, 
    createSlot, 
    getAllDoctors, 
    softDeleteDoctor, 
    blockDoctor, 
    unblockDoctor,
    resetPassword,
    forgotPassword,
    verifyOtpAndSetNewPassword,
    cancelAppointment,
    getDoctorAppointments,
    deleteSlot,
    updateSlot,
    getPendingAppointments,
    getCompletedAppointments,
    patientcompleteAppointment
}