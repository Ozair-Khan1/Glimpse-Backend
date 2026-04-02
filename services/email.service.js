const dotEnv = require('dotenv')
const nodemailer = require('nodemailer')

dotEnv.config()
console.log(process.env.EMAIL_USER)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error) => {
    if(error) {
        console.log('Error connecting to email server:', error)
    } else {
        console.log('Email server is ready to send messages')
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Ozair Khan" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log('Message sent', info.messageId);
        console.log('URL: %s', nodemailer.getTestMessageUrl(info))
    } catch (error) {
        console.log('Error sending email', error)
    }
}

module.exports = sendEmail