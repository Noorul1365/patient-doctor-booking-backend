// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendDoctorCredentials = async (email, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Doctor Account Credentials',
    text: `Welcome! Here are your login credentials:\n\nEmail: ${email}\nPassword: ${password}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Doctor credentials sent to email');
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};
