import { Response, Request } from "express";
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import session from 'express-session';
import cors from 'cors';
import { dbConnect } from "./db/db";
import passport from "passport";
const userRoutes = require("./routes/user.routes");
const doctorRoutes = require("./routes/doctor.routes");
dotenv.config();

const app = express();
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser())

const pInit = passport.initialize.bind(passport);
const pSession = passport.session.bind(passport);

app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 * 7 //7days
    }
  }))
app.use(pInit());
app.use(pSession());

app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE'
  })
);

dbConnect()

//routes
app.get('/', (req: Request, res: Response) => {
  res.send({ title: 'Express js' })
});

app.use("/auth", userRoutes);
app.use("/doctor", doctorRoutes);

const port = process.env.PORT
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

module.exports = app;