const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new(PrismaClient);
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        transporter.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "Berhasil Mendaftar",
            text: "Berhasil mendaftar"
        });

        res.io.emit('welcome-notif', `Akun ${email} berhasil dibuat`)
        res.status(201).json({ message: 'Akun berhasil dibuat', user: newUser });
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if(!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send("Email atau password tidak valid");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
};