import passport from "passport";
import userModel from "../models/user.model";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../types/types";
import dotenv from 'dotenv';
dotenv.config();

const clientID = process.env.GOOGLE_CLIENT_ID as string;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET as string;
const callbackURL = process.env.GOOGLE_CALLBACK_URL as string;

if (!clientID || !clientSecret || !callbackURL) {
    throw new Error("Google OAuth environment variables are not provided");
}

passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL
},
    async function (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) {
        try {
            // console.log(accessToken);
            // console.log("Profile received", profile);

            const findUserByGoogleId = await userModel.findOne({ googleId: profile.id });
            if (findUserByGoogleId) {
                return done(null, findUserByGoogleId,accessToken);
            }

            const existingUser = await userModel.findOne({ email: profile.emails?.[0]?.value });
            if (existingUser) {
                return done(new Error('Email already in use'));
            }

            const newUser: User = new userModel({
                typeofLogin: profile.provider,
                googleId: profile.id,
                fullName: profile.displayName,
                email: profile.emails?.[0]?.value,
                emailVerified: profile.emails[0].verified,
                profilePic: profile.photos[0].value,
                termsAccepted: true,
                emailVerificationOTP: null,
                emailVerificationExpiry:null
            });

            await newUser.save();
            done(null,  newUser);
        } catch (err) {
            console.error(`Error in Google OAuth: ${err}`);
            return done(err);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;
