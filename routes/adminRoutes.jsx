const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.jsx');
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController } = require('../controllers/adminCtrl.jsx');

const router = express.Router();

//get || users
router.get('/getAllUsers', authMiddleware, getAllUsersController);

//get || doctors
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

//post || account status
router.post('/changeAccountStatus', authMiddleware, changeAccountStatusController)

module.exports = router;