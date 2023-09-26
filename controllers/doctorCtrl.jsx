const doctorModel = require('../models/doctorModels.jsx');
const appointmentModel = require('../models/appointmentModels.jsx');
const userModel = require('../models/userModels.jsx');

//doc info ctrl
const getDoctorInfoController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: "Doctor data fetch success",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error getting doctor info',
            success: false,
            error,
        });
    }
};

//update profile ctrl
const updateProfileController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOneAndUpdate({ userId: req.body.userId }, req.body);
        res.status(201).send({
            success: true,
            message: "Doctor Profile Updated",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Doctor profile update issue',
            success: false,
            error,
        });
    }
};

//get doctor by id Ctrl
const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
        res.status(200).send({
            success: true,
            message: 'Single Doctor Info Fetched',
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Get Single Doctor Info',
        });
    }
};

//get appointments 
const doctorAppointmentsController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        const appointments = await appointmentModel.find({ doctorId: doctor._id });
        res.status(200).send({
            success: true,
            message: 'Doctor Appointments Fetch Successfully',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Doctor Appointments',
        });
    }
};

const updateStatusController = async (req, res) => {
    try {
        const {appointmentsId, status} = req.body;
        const appointments = await appointmentModel.findByIdAndUpdate(appointmentsId, {status});
        const user = await userModel.findOne({ _id: appointments.userId });
        const notification = user.notification;
        notification.push({
            type: 'Status Updated',
            message: `Your appointment has been updated ${status}`,
            onCLickPath: '/doctor-appointments',
        });
        await user.save();
        res.status(200).send({
            success: true,
            message: 'Appointments Status Updated',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'Error in Update Status',
        });
    }
};

module.exports = { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentsController, updateStatusController }