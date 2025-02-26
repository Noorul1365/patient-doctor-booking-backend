const express = require('express');
const router = express.Router();
const { bookAppointment, registerPatient, loginPatient, changePassword, verifyOtpAndSetNewPassword, forgotPassword, getAllDoctors } = require('../controllers/patientController');
const { patientAuth } = require('../middlewares/patientAuth');

router.post('/patientRegister', registerPatient);
router.post('/patientLogin', loginPatient);
router.post('/bookappointment', patientAuth, bookAppointment);
router.patch('/changepassword/:patientId', patientAuth, changePassword);
router.post('/forgotPassword', patientAuth, forgotPassword);
router.post('/verifyAndSetPassword', patientAuth, verifyOtpAndSetNewPassword);
router.get('/getAllDoctor', patientAuth, getAllDoctors);


module.exports = router;