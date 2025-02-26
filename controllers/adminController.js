const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel.js');
const Slot = require('../models/slotModel.js');
const Doctor = require('../models/docterModel.js');
const Appointment = require('../models/appointmentModel.js');
require('dotenv').config()

// Admin Signup or Login
const adminSignupOrLogin = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if admin already exists
    let admin = await Admin.findOne({ email });

    if (!admin) {
      // Admin does not exist, so register them
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      admin = new Admin({
        email,
        password: hashedPassword,
        name
      });

      await admin.save();

      // Generate JWT Token
      const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(201).json({
        message: 'Admin registered and logged in successfully',
        token,
      });
    }

    // If admin exists, check the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Token for login
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({
      message: 'Admin logged in successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    // `isDeleted: false` filter lagayenge taaki sirf active doctors hi fetch ho
    const doctors = await Doctor.find().select('-password');

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

const getAllSlot = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

const getAllAppointment = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};


module.exports = { adminSignupOrLogin, getAllSlot, getAllAppointment, getAllDoctors }
