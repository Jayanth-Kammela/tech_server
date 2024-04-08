import mongoose from "mongoose";
import { AppointmentType } from "types/types";
import { status } from "../utils/helper";
import { v4 as uuidv4 } from 'uuid';

const appoinmentModel = new mongoose.Schema<AppointmentType>({
    appointmentId: {
        type: String,
        default: () => uuidv4().substring(0, 16),
        unique: true,
        required: true
    },
    startTime: {
        type: Date,
    },
    endTime: {
        type: Date,
    },
    patientName: {
        type: String,
        trim: true,
        required: [true, 'Please add a Patient name'],
    },
    patientAge: {
        type: Number,
        trim: true,
        required: [true, 'Please add a Patient age'],
    },
    gender: {
        type: String,
        enum: ['none', 'male', 'female', 'others']
    },
    patientProblem: {
        type: String,
        trim: true,
        required: [true, 'Please add a Patient problem'],
    },
    bookedBy:{
        type:  mongoose.Schema.Types.ObjectId,
        trim: true,
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        trim: true,
    },
    appointmentStatus: {
        type: String,
        enum: [status.PENDING, status.CONFIRMED, status.COMPLETED, status.CANCELLED,status.EXPIRED],
        default: status.PENDING
    }

}, {
    timestamps: true,
})

export default mongoose.model('DoctorAppointment', appoinmentModel)