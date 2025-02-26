const bcrypt = require('bcrypt');
const Patient = require('../models/patientModel');
const Slot = require('../models/slotModel');
const { sendOtpEmail } = require('../utils/doctorEmail');
const Doctor = require('../models/docterModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Appointment = require('../models/appointmentModel');

const registerPatient = async (req, res) => {
    const { name, email, password, phoneNumber, gender, age } = req.body;
  
    try {
      // Check if the patient already exists
      const existingPatient = await Patient.findOne({ email });
      if (existingPatient) {
        return res.status(400).json({ message: 'Patient already registered' });
      }
  
      // Create new patient
      const newPatient = new Patient({
        name,
        email,
        password,
        phoneNumber,
        gender,
        age
      });
  
      // Save the patient
      await newPatient.save();
  
      res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};
  // Login a patient
const loginPatient = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the patient exists
      const patient = await Patient.findOne({ email });
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ patientId: patient._id }, process.env.PATIENT_JWT_SECRET, { expiresIn: '1h' });
      
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const bookAppointment = async (req, res) => {
    const { patientId, doctorId, slotId, appointmentDate, appointmentDay, appointmentTime } = req.body;
  
    try {
      // Check if the slot exists and is available
      const slot = await Slot.findById(slotId);
      if (!slot) {
        return res.status(404).json({ message: 'Slot not found' });
      }
      if (slot.isBooked) {
        return res.status(400).json({ message: 'Slot is already booked' });
      }
  
      // Check if the patient exists
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Create the appointment
      const appointment = new Appointment({
        patient: patientId,
        doctor: doctorId,
        slot: slotId,
        appointmentDate,
        appointmentDay,
        appointmentTime
      });
  
      // Save the appointment and mark the slot as booked
      await appointment.save();
      slot.isBooked = true; // Mark the slot as booked
      await slot.save();
  
      res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const changePassword = async (req, res) => {
    const { patientId } = req.params; // Get patientId from request parameters
    const { oldPassword, newPassword } = req.body; // Get old and new passwords from request body
  
    try {
      const patient = await Patient.findById(patientId);
  
      if (!patient) {
        return res.status(404).json({ message: 'patient not found' });
      }
  
      // Check if the old password matches
      const isMatch = await patient.comparePassword(oldPassword);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
  
      //const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the password
      // Update the password
      patient.password = newPassword; // Ensure new password is hashed before saving
      await patient.save();
  
      res.status(200).json({ message: 'Password change successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body; // Get email from request body
  
    try {
      const patient = await Patient.findOne({ email });
  
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Generate a 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
      // Send OTP to the patient's email
      await sendOtpEmail(email, otp);
  
      // Store the OTP temporarily (e.g., in the session or in-memory store)
      // Here, we are just sending it back in response for simplicity
      // You might want to use a better approach for storing OTPs securely.
      patient.otp = otp; // Save OTP to the patient record or use a separate storage
      await patient.save();
  
      res.status(200).json({ message: 'OTP sent to your email', otp });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

const verifyOtpAndSetNewPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body; // Get email, OTP, and new password from request body
  
    try {
      const patient = await Patient.findOne({ email });
  
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
  
      // Check if the OTP matches
      if (patient.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      // Update the password
      patient.password = newPassword; // Ensure new password is hashed before saving
      patient.otp = undefined; // delete after use
      // patient.otp = null; // Clear OTP after use
      await patient.save();
  
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// controllers/doctorController.js
const getAllDoctors = async (req, res) => {
  try {
    // `isDeleted: false` filter lagayenge taaki sirf active doctors hi fetch ho
    const doctors = await Doctor.find({ isDeleted: false }).select('-password');

    // Agar doctors nahi milte toh empty array return karenge
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: 'No doctors available.' });
    }

    // Successfully doctors fetch ho gaye
    res.status(200).json({ message: 'Doctors fetched successfully', doctors });
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

module.exports = {registerPatient, loginPatient, bookAppointment, changePassword, forgotPassword, verifyOtpAndSetNewPassword, getAllDoctors }