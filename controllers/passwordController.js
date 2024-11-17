require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new(PrismaClient);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendConfirmationEmail = async (email) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "Password dirubah",
            text: "Password berhasil dirubah"
        });
    } catch(error) {
        console.error("Error sending confirmation email:", error);
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if(!user) {
        return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${process.env.BASE_URL}/password/reset-password?token=${resetToken}`;

    transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: "Reset Password",
        html: `<p>Silahkan klik link berikut untuk reset password:</p> <a href="${resetLink}" target="_blank">${resetLink}</a>`
    });

    console.log("Reset token: ", resetToken);
    res.send('Link reset password telah dikirim');
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body || req.query || {};

    console.log("Received token: ", token);
    try {
        if(!token) {
            return res.status(401).json({ message: 'Token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });

        await sendConfirmationEmail(user.email);
        
        res.io.emit('password-reset-success', 'Password berhasil dirubah');
        res.send('Password berhasil diubah');
    } catch(error) {
        console.log(error);
        if(error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Token invalid' });
    }
};