import { Request, Response } from "express";
import mongoose from "mongoose";
import { success, error } from '../utils/response';
import appointmentsModel from "../models/appointments.model";
import { doctorModel } from "../models/doctor.model";

const bookAppointment = async (req: Request, res: Response) => {
    try {
        const {  patientName, patientAge, patientProblem, gender, doctorId, user, startTime, endTime } = req.body;

        const tempStartTime = new Date(startTime);
        const tempEndTime = new Date(endTime)

        const checkAppointments = await appointmentsModel.find({
            doctorId: doctorId,
            $or: [
                { $and: [{ startTime: { $gte: tempStartTime } }, { startTime: { $lte: tempEndTime } }] },
                { $and: [{ endTime: { $lte: tempEndTime } }, { time: { $gte: tempStartTime } }] }

            ]
        });



        console.log("checkAppointment>>", checkAppointments)

        if (checkAppointments.length > 0) {
            return res.status(400).send(error(400, "This slot is already booked. Please book another slot."));
        }

        const appointment = await appointmentsModel.create({
            patientName,
            patientAge,
            patientProblem,
            startTime:tempStartTime,
            endTime:tempEndTime,
            gender,
            doctorId,
            bookedBy: user._id.toString()
        });

        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).send(error(404, "Doctor not found"));
        }

        doctor.appointments.push(appointment._id);
        await doctor.save();
        return res.status(201).send(success(201, "Appointment booked successfully", appointment));
    } catch (err: any) {
        console.error(err);
        return res.status(500).send(error(500, err.message));
    }
}


const getDoctorAppointments = async (req: Request, res: Response) => {
    const doctorId = req.body.doctor._id.toString()

    try {
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).send(error(400, "Provide a valid user Id"))
        }
        const details = await appointmentsModel.find({ doctorId: doctorId });

        if (!details) {
            return res.status(404).send(error(404, "No appointments found for the doctor"));
        }

        return res.status(200).send(success(200, "Appointment details", details));
    } catch (err: any) {
        return res.status(500).send(error(500, err.message));
    }
}

const getUserAppointments = async (req: Request, res: Response) => {
    const userId = req.body.user._id.toString();

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send(error(400, "Provide a valid user Id"))
        }

        const details = await appointmentsModel.find({ bookedBy: userId }).populate("doctorId", "fullName qualifications");
        // console.log(details);


        if (!details) {
            return res.status(404).send(error(404, "No appointments found for the user"));
        }

        return res.status(200).send(success(200, "Appointment details", details));
    } catch (err: any) {
        return res.status(500).send(error(500, err.message));
    }
}

const updateUserAppointments = async (req: Request, res: Response) => {
    const { _id } = req.body.user;
    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send(error(400, "Provide a valid user Id"));
        }

        const updatedAppointment = await appointmentsModel.findOneAndUpdate({ bookedBy: _id }, { $set: req.body }, { new: true });

        if (!updatedAppointment) {
            return res.status(404).send(error(404, "No appointments found for the user"));
        }

        return res.status(200).send(success(200, "Appointment updated successfully", updatedAppointment));
    } catch (err: any) {
        return res.status(500).send(error(500, err.message));
    }
};

const updateDoctorAppointments = async (req: Request, res: Response) => {

    const { _id } = req.body.doctor;
    try {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).send(error(400, "Provide a valid user Id"));
        }

        const updatedAppointment = await appointmentsModel.findOneAndUpdate({ doctorId: _id }, { $set: req.body }, { new: true });

        if (!updatedAppointment) {
            return res.status(404).send(error(404, "No appointments found for the doctor"));
        }

        return res.status(200).send(success(200, "Appointment updated successfully", updatedAppointment));
    } catch (err: any) {
        return res.status(500).send(error(500, err.message));
    }
}


module.exports = { bookAppointment, getDoctorAppointments, getUserAppointments, updateUserAppointments, updateDoctorAppointments }
