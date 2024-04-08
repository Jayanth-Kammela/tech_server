import mongoose from 'mongoose';
import { UserType } from '../types/types';

const userModel = new mongoose.Schema<UserType>({
    fullName: {
        type: String,
        trim: true,
        required: [true, 'Please add a fullname'],
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
    googleId: {
        type: String,
    },
    githubId: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        required: [true, 'Please add a E-mail'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid E-mail'
        ],
        // validate: {
        //     validator: function (value: any) {
        //         return validator.isEmail(value);
        //     },
        //     message: 'Invalid email address'
        // }
    },
    password: {
        type: String,
        trim: true,
        minlength: [6, 'password must have at least six(6) characters'],
    },
    gender: {
        type: String,
        enum: ['none', 'male', 'female', 'others']
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
        default: 'user',
    },
    typeofLogin: {
        type: String,
        enum: ['github', 'google', 'local'],
    },
    appointments:[],
    termsAccepted: {
        type: Boolean,
        required: [true, 'Please accept a terms'],
        default: false
    },
    token: {
        type: String,
    }
}, {
    timestamps: true,
});

userModel.methods.verifyOTP = function () {

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 5 * 60 * 1000;//5min

    this.emailVerificationOTP = otp;
    this.emailVerificationExpiry = otpExpiry;

    return otp;
};

export default mongoose.model<UserType>("User", userModel);