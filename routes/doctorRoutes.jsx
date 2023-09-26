const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.jsx');
const { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentsController, updateStatusController } = require('../controllers/doctorCtrl.jsx');

const router = express.Router();

//post || single doc info
router.post('/getDoctorInfo', authMiddleware, getDoctorInfoController);

//post || update profile
router.post('/updateProfile', authMiddleware, updateProfileController);

//post || get single doc info
router.post('/getDoctorById', authMiddleware, getDoctorByIdController);

//post || get single doc info
router.post('/getDoctorById', authMiddleware, getDoctorByIdController);

//get || appointments
router.get('/doctor-appointments', authMiddleware, doctorAppointmentsController);

//post || updatestatus
router.post('/update-status', authMiddleware, updateStatusController)

module.exports = router;