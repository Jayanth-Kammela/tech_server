import mongoose from "mongoose";
import { DoctorType, Qualification } from "types/types";

const QualificationSchemca = new mongoose.Schema<Qualification>({
    degree: {
        type: String,
        required: [true, 'Please enter a degree']
    },
    institutionName: {
        type: String,
        required: [true, 'Please enter a institution']
    },
    fromYear: {
        type: Number,
        required: [true, 'Please enter a from year']
    },
    toYear: {
        type: Number,
        required: [true, 'Please enter a to year']
    },
});

const QualificationModel = mongoose.model<Qualification>("Qualification", QualificationSchemca);

const doctorSchema = new mongoose.Schema<DoctorType>({
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Please enter a fullname'],
        match: /^[\p{L}].*$/u
    },
    mobileNumber: {
        type: Number,
        trim: true,
        minlength: 10,
        maxlength: 10,
        default: null
    },
    profilePic: {
        type: String,
        default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Please enter a E-mail'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid E-mail'
        ],
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Please enter a Password'],
        minlength: [6, 'password must have at least six(6) characters'],
    },
    qualifications: [QualificationSchemca],
    appointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorAppointment'
    }],
    gender: {
        type: String,
        default: 'none'
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationOTP: {
        type: Number,
    },
    emailVerificationExpiry: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        trim: true,
        enum: ['user', 'doctor', 'admin', 'superadmin'],
    },
    termsAccepted: {
        type: Boolean,
        required: [true, 'Please accept a terms'],
        default: false
    },
    location: {
        type: String,
    },
    about: {
        type: String,
        trim: true,
    },
    yearsofExpericed: {
        type: Number,
        trim: true,
    },
    patientsTreated: {
        type: Number,
        trim: true,
    },
    specilization: {
        type: [String],
    },
    token: {
        type: String,
    },
}, {
    timestamps: true,
});

doctorSchema.methods.verifyOTP = function () {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    this.emailVerificationOTP = otp;
    this.emailVerificationExpiry = otpExpiry;

    return otp;
};
const doctorModel = mongoose.model<DoctorType>("Doctor", doctorSchema);
export { doctorModel, QualificationModel }