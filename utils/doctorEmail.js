const nodemailer = require('nodemailer');

const sendOtpEmail = async (email, otp) => {
  // Set up the transporter for nodemailer
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', // Use Ethereal's SMTP server
    port: 587, // Standard port for TLS
    secure: false, // Use true for port 465, false for other ports
    auth: {
      user: 'weldon.hegmann99@ethereal.email', // Your Ethereal email
      pass: 'A37bpepBjz52TMZMpC' // Your Ethereal password
    }
  });

  const mailOptions = {
    from: 'weldon.hegmann99@ethereal.email', // Your Ethereal email
    to: email, // Recipient email
    subject: 'Your OTP for Password Reset',
    text: `Your OTP for password reset is ${otp}.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully');
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

module.exports = { sendOtpEmail };
