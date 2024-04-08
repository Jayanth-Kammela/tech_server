import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.model";
import { error } from "../utils/response";
const jwt = require("jsonwebtoken");


const userAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(400).send(error(400, "Authorization token Required"));
    }
    const token = authorization.split(" ")[1];

    try {
        const { _id } = jwt.verify(token, process.env.SECERT);
        // console.log(_id);
        req.body.user = await userModel.findOne({ _id }).select("_id");
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).send(error(401, "Authorization token is not authorized"));
    }
};
export { userAuth };