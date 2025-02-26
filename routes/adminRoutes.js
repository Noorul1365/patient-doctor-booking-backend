const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middlewares/adminAuth.js');
//const { docterAuth } = require('../middlewares/docterAuth.js');
const { adminSignupOrLogin, getAllSlot, getAllAppointment, getAllDoctors } = require('../controllers/adminController.js');


router.post('/login', adminSignupOrLogin);
router.get('/getAllSlot', adminAuth, getAllSlot)
router.get('/getAllAppointment', adminAuth, getAllAppointment);
router.get('/getAllDocters', adminAuth, getAllDoctors)

module.exports = router;