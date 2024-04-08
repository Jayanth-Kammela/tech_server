import passport from "passport";
import userModel from "../models/user.model";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import dotenv from 'dotenv';
dotenv.config();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID as string;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET as string;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL as string;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !GITHUB_CALLBACK_URL) {
    throw new Error("GitHub OAuth environment variables are not provided.");
}

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL
},
    async function (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any, info?: any) => void) {
        try {

            const response = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const emailData: any = await response.json();
            // console.log(emailData[0]?.email);
            // const findEmail = emailData.find((email:any) => email.primary);


            const findUserByGithub = await userModel.findOne({ githubId: profile.id });
            if (findUserByGithub) {
                return done(null, findUserByGithub, accessToken);
            }

            const existingUser = await userModel.findOne({ email: emailData[0]?.email });
            if (existingUser) {
                return done(new Error('Email already in use'));
            }

            const newUser = new userModel({
                typeofLogin: profile.provider,
                githubId: profile.id,
                fullName: profile.displayName,
                email: emailData[0]?.email,
                emailVerified: emailData[0]?.verified,
                profilePic: profile.photos[0].value,
                termsAccepted: true,
                emailVerificationOTP: null,
                emailVerificationExpiry: null
            });

            await newUser.save();
            done(null, newUser);
        } catch (err) {
            console.error(`Error in GitHub OAuth: ${err}`);
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;
