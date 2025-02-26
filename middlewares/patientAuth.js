const jwt = require('jsonwebtoken');
require('dotenv').config();

const patientAuth = (req, res, next) => {
  // Get token from headers
  const token = req.header('Authorization')?.split(' ')[1]; // Assuming token format is "Bearer <token>"

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.PATIENT_JWT_SECRET);

    // Attach decoded payload to request (e.g., patientId)
    req.patientId = { id: decoded.patientId };
    console.log(req.patientId);

    next(); // Continue to the next middleware/route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { patientAuth } ;
