const express = require('express')
const app = express()
const connectDB = require('./db/db');
const cookieParser = require('cookie-parser');

require('dotenv').config()
require('./cronSlot/weeklySlotDuplication.js');
const adminRoutes = require('./routes/adminRoutes.js');
const patientRoutes = require('./routes/patientRoutes.js');
const doctorRoutes = require('./routes/docterRoutes.js');

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

connectDB();

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctor', doctorRoutes);
// app.use('/api/appointments', appointmentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 