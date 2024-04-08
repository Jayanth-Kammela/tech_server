import { CustomError } from "types/types";
const jwt = require("jsonwebtoken");
import userModel from "../models/user.model";
import {doctorModel} from "../models/doctor.model";

const generateTokens = async (id: string,usertype:string) => {
    try {
        const payload = { _id: id };
        const accessToken = jwt.sign(payload, process.env.SECERT, {
            expiresIn: 5 * 60 * 1000, //5min
        });
        const refreshToken = jwt.sign(payload, process.env.REFRESH_SECERT, {
            expiresIn: "30d",
        });

        const { _id } = jwt.verify(accessToken, process.env.SECERT);

        if (usertype == "doctor") {
            const doctor = await doctorModel.findOneAndUpdate(
                { _id: id },
                { token: refreshToken }
            );
            if (!doctor) {
                const error: CustomError = { message: 'No such doctor found' };
                throw new Error(JSON.stringify(error));
            }
          }
          else if (usertype === "admin") {
            const admin = await userModel.findOneAndUpdate(
                { _id: id },
                { token: refreshToken }
            );
            if (!admin) {
                const error: CustomError = { message: 'No such admin found' };
                throw new Error(JSON.stringify(error));
            }
          } 
           else {
            const user = await userModel.findOneAndUpdate(
                { _id: id },
                { token: refreshToken }
            );
            if (!user) {
                const error: CustomError = { message: 'No such user found' };
                throw new Error(JSON.stringify(error));
            }
          }

        // const user = await userModel.findOneAndUpdate(
        //     { _id: id },
        //     { token: refreshToken }
        // );
        // if (!user) {
        //     const error: CustomError = { message: 'No such user found' };
        //     throw new Error(JSON.stringify(error));
        // }

        return { accessToken, refreshToken };
    } catch (err: any) {
        console.log(err);
        throw Error(err);
    }
};

const verifyToken = async (refreshToken: string,) => {
    try {
        const user = await userModel.findOne({ token: refreshToken });
        // console.log(user + "service");
        
        if (!user) {
            const error: CustomError = { message: 'Invalid refresh token' };
            throw new Error(JSON.stringify(error));
        }

        const { _id } = jwt.verify(refreshToken, process.env.REFRESH_SECERT);
        return _id;
    } catch (err: any) {
        throw Error(err);
    }
};

export { generateTokens, verifyToken };
