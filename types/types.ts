import mongoose from "mongoose";
import { Document } from "mongoose";

export interface UserType extends Document {
    fullName: string;
    googleId: string;
    githubId: string;
    email: string;
    password: string;
    mobileNumber: number;
    profilePic: string;
    gender: string;
    typeofLogin: string;
    emailVerified: boolean;
    emailVerificationOTP: number | undefined;
    emailVerificationExpiry: Date | number | undefined;
    token: string;
    role: string;
    termsAccepted: boolean;
    appointments: []
    verifyOTP: () => { otp: number, tokenExpiry: number };
}

export interface Qualification {
    degree: string;
    institutionName: string;
    fromYear: Date | number;
    toYear: Date | number
}

export interface User extends Document {
    typeofLogin: string;
    googleId: string;
    fullName: string;
    email?: string | any;
    emailVerified: boolean;
    profilePic: string;
}

export interface emailDataType extends Document {
    email: string;
    verified: boolean;
}

export interface CustomRequest extends Request {
    user?: User;
    authInfo: string;
}

export interface DoctorType extends Document {
    fullName: string;
    email: string;
    password: string;
    mobileNumber: number;
    profilePic: string;
    gender: string;
    emailVerified: boolean;
    emailVerificationOTP: number | undefined | null;
    emailVerificationExpiry: Date | number | undefined | null;
    token: string;
    role: string;
    termsAccepted: boolean;
    verifyOTP: () => { otp: number, tokenExpiry: number };
    appointments: any[];
    about: string;
    yearsofExpericed: number;
    patientsTreated: number;
    specilization: string[];
    qualifications: Qualification[];
    location: string;
}

export interface AppointmentType extends Document {
    appointmentId: string;
    date: Date;
    startTime:Date;
    endTime:Date;
    time: string;
    patientName: string;
    gender: string;
    patientAge: number;
    patientProblem: string;
    bookedBy: mongoose.Types.ObjectId;
    doctorId: mongoose.Types.ObjectId;
    appointmentStatus: string;
    
}

export interface CustomError {
    message: string;
}

export interface SuccessResponse {
    status: boolean;
    statusCode: number;
    message: string;
    result: any;
}

export interface ErrorResponse {
    status: boolean;
    statusCode: number;
    message: string;
}