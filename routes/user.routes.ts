const express = require("express");
const router = express.Router();
const { userSignUp, userSignIn, verifyEmail, refreshUserToken, resendOtp, userDetails,userByQuery, updateUser, OAuthLogin } = require("../controllers/user.controller");
import passportGoogle from "../stratagies/google.passport";
import passportGithub from "../stratagies/github.passport";
// import passport from "passport";
import { userAuth } from "../middlewares/user.middleware";
const { bookAppointment, getUserAppointments, updateUserAppointments, } = require("../controllers/appointment.controller");

//auth user
router.post("/signup", userSignUp);
router.post("/signin", userSignIn);

// const authenticate = passport.authenticate.bind(passport);

//google oauth
router.get('/google/login', passportGoogle.authenticate("google", {
    scope: ['profile', 'email']
}))

router.get("/google/callback", passportGoogle.authenticate("google", {
    failureRedirect: "/google/login",
    session: false,
})
    , OAuthLogin
);

//github oauth
router.get('/github/login', passportGithub.authenticate("github", { scope: [ 'user:email' ] }))

router.get("/github/callback", passportGithub.authenticate("github", {
    failureRedirect: "/github/login",
    session: false,
})
    , OAuthLogin
);

//verify user email
router.post("/verify-email", userAuth, verifyEmail);
router.post("/resend-otp", userAuth, resendOtp);

//refresh token
router.post("/refreshtoken", refreshUserToken);

//user profile
router.get('/user-details', userAuth, userDetails);
router.get('/find-details', userAuth, userByQuery);
router.patch('/update-user', userAuth, updateUser);

//appointments
router.get("/appointment-details", userAuth, getUserAppointments);
router.post("/book-appointments", userAuth, bookAppointment);
router.patch("/update-appointments", userAuth, updateUserAppointments);


module.exports = router;
