const nodemailer = require("nodemailer");

const sendEmail = async (email: string, subject: string, html: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASS,
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: subject,
            html: html
        });

        console.log("Email has sent sucessfully");
    } catch (error) {
        console.log(error, "Email not sent");
    }
};

export { sendEmail };