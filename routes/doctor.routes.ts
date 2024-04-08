const express = require("express");
const router = express.Router();
const { doctorSignUp, doctorSignIn, refreshUserToken, verifyEmail, resendOtp, doctorDetails, updateDoctor, postQualification, updateQualification, deleteQualification } = require("../controllers/doctor.controller");
const { bookAppointment, getDoctorAppointments, updateDoctorAppointments } = require("../controllers/appointment.controller");
import { doctorAuth } from "../middlewares/doctor.middleware";

//auth doctor
router.post("/signup", doctorSignUp);
router.post("/signin", doctorSignIn);

//verify doctor email
router.post("/verify-email", doctorAuth, verifyEmail);
router.post("/resend-otp", doctorAuth, resendOtp);

//refresh token
router.post("/refreshtoken", refreshUserToken);

//doctor profile
router.get('/doctor-details', doctorAuth, doctorDetails);
router.patch('/update-doctor', doctorAuth, updateDoctor);
router.post('/post-qualification', doctorAuth, postQualification);
router.patch('/update-qualification/:qualificationId', doctorAuth, updateQualification);
router.delete('/delete-qualification/:qualificationId', doctorAuth, deleteQualification);

//doctor appointments
// router.post("/appointments", doctorAuth, bookAppointment);
router.get("/appointment-details", doctorAuth, getDoctorAppointments);
router.patch("/update-appointments", doctorAuth, updateDoctorAppointments);


module.exports = router;