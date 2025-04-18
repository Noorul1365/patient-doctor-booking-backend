const jwt = require('jsonwebtoken');
require('dotenv').config();

const docterAuth = (req, res, next) => {
  // Get token from headers
  const token = req.header('Authorization')?.split(' ')[1]; // Assuming token format is "Bearer <token>"

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.DOCTER_JWT_SECRET);

    // Attach decoded payload to request (e.g., patientId)
    req.doctor = { id: decoded.doctorId };
    console.log(req.doctor);

    next(); // Continue to the next middleware/route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = {docterAuth} ;
