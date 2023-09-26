const userModel = require('../models/userModels.jsx');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModels.jsx');
const appointmentModel = require('../models/appointmentModels.jsx');
const moment = require('moment');

//register ctrl
const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(200).send({ success: false, message: 'User Already Exist' })
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        req.body.password = hashedPassword
        const newUser = new userModel(req.body)
        await newUser.save()
        res.status(201).send({ success: true, message: 'Register Successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: `Register Controller ${error.message}` })
    }
};

//login ctrl
const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).send({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).send({ success: false, message: 'Invalid Email or Password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ success: true, message: "Login Success", token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Error in Login Controller ${error.message}` });
    }
};

//auth ctrl
const authController = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId });
        user.password = undefined;
        if (!user) {
            return res.status(200).send({ success: false, message: 'User not found' })
        } else {
            res.status(200).send({
                success: true,
                data: user,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'auth error', error });
    }
};

//doctor ctrl
const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = await doctorModel({ ...req.body, status: "pending" });
        await newDoctor.save();
        const adminUser = await userModel.findOne({ isAdmin: true });
        const notification = adminUser.notification
        notification.push({
            type: 'apply-doctor-request',
            message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath: '/admin/doctors',
            }
        })
        await userModel.findByIdAndUpdate(adminUser._id, { notification })
        res.status(201).send({
            success: true,
            message: "Doctor Account Applied Successfully!",
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error While Applying For Doctor",
        })
    }
}

//notification ctrl
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        const seennotification = user.seennotification;
        const notification = user.notification;
        seennotification.push(...notification);
        user.notification = [];
        user.seennotification = notification;
        const updatedUser = await user.save();
        res.status(200).send({
            success: true,
            message: "All notification marked as read",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in Notification',
            success: false,
            error,
        });
    }
}

//delete notification ctrl
const deleteAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        user.notification = [];
        user.seennotification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "Notification Deleted Successfully!",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "unable to delete all notification",
            error,
        });
    }
};

//get all doctors Ctrl
const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: "approved" });
        res.status(200).send({
            success: true,
            message: 'Doctors List Fetched Successfully',
            data: doctors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error,
            success: false,
            message: 'Error While Fetching Doctors',
        });
    }
};

//book appointment Ctrl
const bookAppointmentController = async (req, res) => {
    try {
        req.body.date = moment(req.body.date, "DD:MM:YYYY").toISOString();
        req.body.time = moment(req.body.time, "HH:mm").toISOString();
        req.body.status = "pending";
        const newAppointment = new appointmentModel(req.body);
        await newAppointment.save();
        const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
        user.notification.push({
            type: 'New-Appointment-request',
            message: `A New Appointment Request From ${req.body.userInfo.name}`,
            onCLickPath: '/user/appointments',
        });
        await user.save();
        res.status(200).send({
            success: true,
            message: 'Appointment Book Successfully',
        });
    } catch (error) {
        console.log(error),
            res.status(500).send({
                error,
                success: false,
                message: 'Error While Booking Appointment',
            });
    }
};

const bookingAvailbilityContoller = async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const fromTime = moment(req.body.time, "HH:mm").subtract(1, 'hours').toISOString();
        const toTime = moment(req.body.time, "HH:mm").add(1, 'hours').toISOString();
        const doctorId = req.body.doctorId;
        const appointments = await appointmentModel.find(
            {
                doctorId,
                date,
                time: {
                    $gte: fromTime,
                    $lte: toTime,
                },
            },
        );
        if (appointments.length > 0) {
            return res.status(200).send({
                success: true,
                message: 'Appointments not Available at this time',
            });
        } else {
            return res.status(200).send({
                success: true,
                message: 'Appointments Available',
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error,
            success: false,
            message: 'Error in Booking',
        });
    }
};

const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: 'User Appointments Fetch Successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error,
            success: false,
            message: 'Error in User Appointments',
        });
    }
};

module.exports = { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmentController, bookingAvailbilityContoller, userAppointmentsController }