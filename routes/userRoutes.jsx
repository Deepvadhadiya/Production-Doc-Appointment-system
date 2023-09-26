const express = require('express');
const { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmentController, bookingAvailbilityContoller, userAppointmentsController } = require('../controllers/userCtrl.jsx');
const authMiddleware = require('../middlewares/authMiddleware.jsx');

//router object
const router = express.Router();

//routes
//login || post
router.post('/login', loginController);

//register || post
router.post('/register', registerController);

//auth || post
router.post('/getUserData', authMiddleware, authController);

//apply doctor || post
router.post('/apply-doctor', authMiddleware, applyDoctorController);

//notification doctor || post
router.post('/get-all-notification', authMiddleware, getAllNotificationController);

//delete notification doctor || post
router.post('/delete-all-notification', authMiddleware, deleteAllNotificationController);

//get all doc || get
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController)

//book appointment || post
router.post('/book-appointment', authMiddleware, bookAppointmentController)

//booking availbility || post
router.post('/booking-availbility', authMiddleware, bookingAvailbilityContoller)

//Appointments list || get
router.get('/user-appointments', authMiddleware, userAppointmentsController)

module.exports = router;