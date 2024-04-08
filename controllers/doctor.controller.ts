import { Request, Response } from "express";
import mongoose from "mongoose";
const jwt = require("jsonwebtoken");
import bcrypt from 'bcrypt';
import { doctorModel, QualificationModel } from "../models/doctor.model"
const { success, error } = require('../utils/response')
import { sendEmail } from "../services/mailService";
import { generateTokens, verifyToken } from "../services/jwtService";
import { comparePasswords } from "../utils/helper";


const doctorSignUp = async (req: Request, res: Response) => {
  const { fullName, email, password, termsAccepted } = req.body;
  try {
    if (!termsAccepted) {
      return res.status(400).send(error(400, 'Terms and conditions must be accepted'));
    }
    const doctorCheck = await doctorModel.findOne({ email });
    if (doctorCheck) {
      return res.status(400).send(error(400, 'Doctor already Exits'));
    }
    const salt = 10
    const hash = await bcrypt.hash(password, salt)
    const doctor = await doctorModel.create({ fullName, email, password: hash, termsAccepted });
    const otp = doctor.verifyOTP();
    await doctor.save();

    const subject = "Account Verification";
    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              text-align: center;
              padding: 20px;
            }
        
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
        
            h2 {
              color: #333333;
            }
        
            h4 {
              color: #333333;
            }
        
            p {
              color: #666666;
            }
        
            a {
              display: inline-block;
              margin-top: 15px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Email Verification</h2>
            <h4>Hello ${fullName}</h4>
            <p>Thank you for signing up. Please use the following OTP to verify your email:</p>
            <h2>${otp}</h2>
            <p>If you didn't sign up or request this, you can ignore this email.</p>
          </div>
        </body>
        </html>
        `;
    await sendEmail(email, subject, html);

    const token = await generateTokens(doctor._id, 'doctor');
    return res.status(201).send(success(201, "OTP sent to email successfully", { fullName: fullName, email: email, tokens: token }));
  } catch (err: any) {
    console.log(err);
    return res.status(400).send(error(400, err.message))
  }
}

const doctorSignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email && !password) {
      return res.status(400).send(error(400, 'Email is required'));
    }

    if (!password) {
      return res.status(400).send(error(400, 'Password is required'));
    }

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.status(401).send(error(401, 'User not found'));
    }

    const isPasswordValid = await comparePasswords(password, doctor.password);

    if (!isPasswordValid) {
      return res.status(401).send(error(401, 'Invalid password'));
    }

    const tokens = await generateTokens(doctor._id, 'doctor');

    return res.status(200).send(success(200, "Signed successfully", { fullName: doctor.fullName, email: doctor.email, tokens }));
  } catch (err: any) {
    console.error(err);
    return res.status(500).send(error(500, err.message));
  }
};

const refreshUserToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const id = await verifyToken(refreshToken);
    const payload = { _id: id };
    const accessToken = await jwt.sign(payload, process.env.SECERT, {
      expiresIn: "14m",
    });
    return res.status(200).send(success(200, "Access token created successfully", { accessToken }))
  } catch (err: any) {
    return res.status(404).send(error(404, err.message))
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  const { emailVerificationOTP } = req.body;

  if (!emailVerificationOTP) {
    return res.status(400).json(error(400, "Email verification OTP is missing"));
  }

  const user = await doctorModel.findOne({
    emailVerificationOTP: emailVerificationOTP,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(error(400, "OTP is invalid or expired"));
  }

  user.emailVerificationOTP = undefined;
  user.emailVerificationExpiry = undefined;
  user.emailVerified = true;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(success(200, "Email is verified successfully", { isEmailVerified: true }));
};

const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const doctor = await doctorModel.findOne({ email: email });

    if (!doctor) {
      return res.status(400).send(success(400, "Doctor not found"));
    }

    if (doctor.emailVerified) {
      return res.status(400).send(success(400, "Email is already verified"));
    }

    const newVerificationOTP = Math.floor(100000 + Math.random() * 900000);
    const expiryTime = Date.now() + 5 * 60 * 1000;

    doctor.emailVerificationOTP = newVerificationOTP;
    doctor.emailVerificationExpiry = expiryTime

    await doctor.save({ validateBeforeSave: false });

    const subject = "Account Verification";
    const html = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              text-align: center;
              padding: 20px;
            }
        
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
        
            h2 {
              color: #333333;
            }
        
            h4 {
              color: #333333;
            }
        
            p {
              color: #666666;
            }
        
            a {
              display: inline-block;
              margin-top: 15px;
              background-color: #007bff;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 5px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Email Verification</h2>
            <h4>Hello ${doctor.fullName}</h4>
            <p>Please use the following OTP to verify your email:</p>
            <h2>${newVerificationOTP}</h2>
            <p>If you didn't sign up or request this, you can ignore this email.</p>
          </div>
        </body>
        </html>
        `;
    await sendEmail(email, subject, html);

    return res.status(200).send(success(200, "Verification code sent successfully"));
  } catch (err: any) {
    console.error(err);
    return res.status(500).send(error(500, err.message))
  }
}

const doctorDetails = async (req: Request, res: Response) => {
  const doctorId = req.body.doctor;

  try {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(401).send(error(401, "No such user found"));
    }

    const desiredFields = "fullName mobileNumber profilePic email emailVerified termsAccepted about yearsofExpericed patientsTreated specilization qualifications appointments";
    const user = await doctorModel.findById(doctorId).select(desiredFields);

    if (!user) {
      return res.status(400).send(error(400, "No such doctor found"));
    }
    return res.status(200).send(success(200, "Doctor details", user));
  } catch (err: any) {
    return res.status(400).send(error(400, err.message));
  }

}

const updateDoctor = async (req: Request, res: Response) => {
  const { _id } = req.body.doctor;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send(error(400, "Provide valid a doctor Id"))
    }
    const doctor = await doctorModel.findByIdAndUpdate({ _id: _id }, { $set: req.body }, { new: true });

    if (!doctor) {
      return res.status(400).send(error(400, "No such doctor found"));
    }

    return res.status(200).send(success(200, "Doctor updated successfully"))
  } catch (err: any) {
    return res.status(401).send(error(401, err.message))
  }
}

const postQualification = async (req: Request, res: Response) => {
  const { _id } = req.body.doctor;
  const { degree, institutionName, toYear, fromYear } = req.body

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send(error(400, "Provide valid a doctor Id"))
    }
    console.log(req.body);

    const qualification = await QualificationModel.create({ degree, institutionName, toYear, fromYear })
    await qualification.save()

    const doctor = await doctorModel.findByIdAndUpdate({ _id: _id }, { $push: { qualifications: qualification } }, { new: true });

    if (!doctor) {
      return res.status(400).send(error(400, "No such doctor found"));
    }

    return res.status(200).send(success(200, "Qualifications uploaded successfully"))
  } catch (err: any) {
    console.log(err);
    return res.status(401).send(error(401, err.message))
  }
}

const updateQualification = async (req: Request, res: Response) => {
  const { _id } = req.body.doctor;
  console.log(_id);

  const { degree, institutionName, toYear, fromYear } = req.body
  const { qualificationId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send(error(400, "Provide valid a doctor Id"))
    }
    console.log(req.body);

    // const qualification = await QualificationModel.create({ degree, institutionName, toYear, fromYear })
    // await qualification.save()

    // const doctor = await doctorModel.findOneAndUpdate({ _id: _id, 'qualifications._id': qualificationId },
    //   { $set: { 'qualifications.$': qualification } }, { new: true });

    const updatedQualification = await QualificationModel.findOneAndUpdate(
      { _id: qualificationId },
      { degree, institutionName, toYear, fromYear },
      { new: true }
    );

    if (!updatedQualification) {
      return res.status(400).send(error(400, "No such qualification found"));
    }

    const doctor = await doctorModel.findOneAndUpdate(
      { _id: _id, 'qualifications._id': qualificationId },
      { $set: { 'qualifications.$': updatedQualification } },
      { new: true }
    );


    if (!doctor) {
      return res.status(400).send(error(400, "No such doctor found"));
    }

    return res.status(200).send(success(200, "Qualifications updated successfully"))
  } catch (err: any) {
    console.log(err);
    return res.status(401).send(error(401, err.message))
  }
}

const deleteQualification = async (req: Request, res: Response) => {
  const { _id } = req.body.doctor;
  const { qualificationId } = req.params

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send(error(400, "Provide valid a doctor Id"))
    }

    const doctor = await doctorModel.findByIdAndUpdate({ _id: _id }, { $pull: { qualifications: { _id: qualificationId } } }, { new: true });

    if (!doctor) {
      return res.status(400).send(error(400, "No such doctor found"));
    }

    return res.status(200).send(success(200, "Qualification deleted successfully"))
  } catch (err: any) {
    console.log(err);
    return res.status(401).send(error(401, err.message))
  }
}


module.exports = { doctorSignUp, doctorSignIn, refreshUserToken, verifyEmail, resendOtp, doctorDetails, updateDoctor, postQualification, updateQualification, deleteQualification }