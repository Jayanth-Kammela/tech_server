import { Request, Response } from "express";
import mongoose from "mongoose";
const jwt = require("jsonwebtoken");
import bcrypt from 'bcrypt';
import userModel from "../models/user.model";
import { comparePasswords } from "../utils/helper";
const { success, error } = require('../utils/response')
import { sendEmail } from "../services/mailService";
import { generateTokens, verifyToken } from "../services/jwtService";
import appointmentsModel from "../models/appointments.model";
import { CustomRequest } from "types/types";


const userSignUp = async (req: Request, res: Response) => {
  const { fullName, email, password, termsAccepted } = req.body;

  try {

    if (!termsAccepted) {
      return res.status(400).send(error(400, 'Terms and conditions must be accepted'));
    }

    const userCheck = await userModel.findOne({ email });
    if (userCheck)
      return res.status(400).send(error(400, 'User already Exits'));
    const salt = 10
    const hash = await bcrypt.hash(password, salt)
    const user = await userModel.create({ typeofLogin: 'local', fullName, email, password: hash, termsAccepted });
    const otp = user.verifyOTP();
    await user.save();

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

    const token = await generateTokens(user._id, 'user');
    return res.status(201).send(success(201, "OTP sent to email successfully", { fullName: fullName, email: email, tokens: token }));
  } catch (err: any) {
    console.log(err);
    return res.status(400).send(error(400, err.message))
  }
}

const userSignIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email && !password) {
      return res.status(400).send(error(400, 'Email & Password is required'));
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).send(error(401, 'User not found'));
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send(error(401, 'Invalid password'));
    }

    const tokens = await generateTokens(user._id, 'user');

    return res.status(200).send(success(200, "Signed successfully", { fullName: user.fullName, email: user.email, tokens }));
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

  const user = await userModel.findOne({
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
    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send(success(400, "User not found"));
    }

    if (user.emailVerified) {
      return res.status(400).send(success(400, "Email is already verified"));
    }

    const newVerificationOTP = Math.floor(100000 + Math.random() * 900000);
    const expiryTime = Date.now() + 5 * 60 * 1000;

    user.emailVerificationOTP = newVerificationOTP;
    user.emailVerificationExpiry = expiryTime

    await user.save({ validateBeforeSave: false });

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
            <h4>Hello ${user.fullName}</h4>
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

const userDetails = async (req: Request, res: Response) => {
  const userId = req.body.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).send(error(401, "Provide a valid user Id"));
    }

    const desiredFields = "fullName mobileNumber profilePic email emailVerified";
    const details = await appointmentsModel.find({ bookedBy: userId }).populate("doctorId", "fullName");

    const user = await userModel.findById(userId).select(desiredFields);

    if (!details) {
      return res.status(400).send(error(400, "No such user found"));
    }

    if (!user) {
      return res.status(400).send(error(400, "No such user found"));
    }
    return res.status(200).send(success(200, "User details", { user, appointments: details }))
  } catch (err: any) {
    return res.status(200).send(error(200, err.message))
  }

}

const userByQuery = async (req: Request, res: Response) => {
  try {
    const search: any = req.query.searchTerm;

    const query = {
      $or: [
        { fullName: { $regex: new RegExp(String(search).toLowerCase(), "i") } },
        { email: { $regex: new RegExp(String(search).toLowerCase(), "i") } },
        // { _id: search },
      ],
    };
    
    
    const desiredFields: string = "fullName mobileNumber profilePic email emailVerified appointments";
    const user = await userModel.find(query).select(desiredFields);
    
    if (user) {
      return res.status(200).send(success(200, "User details", user));
    } else {
      return res.status(400).send(error(400, "No such user found"));
    }
  } catch (err:any) {
    console.error(err);
    res.status(500).send({ success: false, message: err.message });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { _id } = req.body.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).send(error(400, "Provide a valid user Id"))
    }
    // const user = await userModel.findOneAndUpdate({ _id: _id }, req.body);
    const user = await userModel.findByIdAndUpdate({ _id: _id }, { $set: req.body }, { new: true });


    if (!user) {
      return res.status(400).send(error(400, "No such user found"));
    }

    return res.status(200).send(success(200, "User updated successfull"))
  }
  catch (err: any) {
    return res.status(500).send(error(500, err.message))
  }
}

const OAuthLogin = async (req: CustomRequest, res: Response) => {
  const userId = req.user?._id.toString();
  const token = req.authInfo

  try {
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 * 2 }); //2days
    res.cookie('_id', userId, { httpOnly: true });

    res.redirect('http://localhost:5173/success');
  } catch (err: any) {
    console.log('OAuth-login' + error);
    return res.status(500).send(error(200, err.message))
  }
};


module.exports = { userSignUp, userSignIn, verifyEmail, refreshUserToken, resendOtp, userDetails, userByQuery, updateUser, OAuthLogin }