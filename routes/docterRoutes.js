const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/adminAuth.js');
const { docterAuth } = require('../middlewares/docterAuth.js');
const { createDoctor, loginDoctor, createSlot, getAllDoctors, blockDoctor, unblockDoctor, softDeleteDoctor, resetPassword, forgotPassword, verifyOtpAndSetNewPassword, cancelAppointment, getDoctorAppointments, deleteSlot, updateSlot, getPendingAppointments, getCompletedAppointments, patientcompleteAppointment } = require('../controllers/doctorController.js');

router.post('/createDoctor', adminAuth, createDoctor);
router.post('/login', loginDoctor);
router.post('/slotCreate', adminAuth, createSlot);
router.delete('/slotDelete/:slotId', adminAuth, deleteSlot);
router.put('/slotUpdate/:slotId', adminAuth, updateSlot);
router.get('/alldoctor', docterAuth, getAllDoctors);
router.delete('/deletedoctor/:doctorId', adminAuth, softDeleteDoctor);
router.patch('/blockdoctor/:doctorId', adminAuth, blockDoctor);
router.patch('/unblockdoctor/:doctorId', adminAuth, unblockDoctor);
router.patch('/resetpassword/:doctorId', docterAuth, resetPassword);
router.post('/forgatPassword', forgotPassword);
router.post('/verifyAndSetPassword', verifyOtpAndSetNewPassword);
router.post('/cancelAppointment/:appointmentId', docterAuth, cancelAppointment);
router.get('/getDoctorAppointments', docterAuth, getDoctorAppointments);
router.get('/getDoctorupcomingAppointments', docterAuth, getPendingAppointments);
router.get('/getDoctorCompleteAppointments', docterAuth, getCompletedAppointments);
router.post('/getCompleteAppointmentsbydDoctorPatient/:appointmentId', docterAuth, patientcompleteAppointment);

module.exports = router;