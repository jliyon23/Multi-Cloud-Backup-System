const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Function to generate 6-digit code
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Function to send email
const sendVerificationEmail = async (email, code) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`,
  }).then((info) => console.log("mail send", info))
  .catch((err) => console.log(err));
};

// Signup Route
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    

    const user = await User.create({ name, email, password: hashedPassword, verificationcode: verificationCode });
    console.log(user);

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Signup successful! Check your email for the verification code." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error signing up." });
  }
};

// Verify Email with 6-Digit Code
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.verified) return res.status(400).json({ error: "Email already verified" });


    if (user.verificationcode !== code) return res.status(400).json({ error: "Invalid verification code" });

    await User.update({ verified: true, verificationcode: null }, { where: { email } });

    res.json({ message: "Email verified successfully!" });
    
  } catch (err) {
    res.status(500).json({ error: "Error verifying email." });
  }
};

// Login Route
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });

    if (!user.verified) return res.status(401).json({ error: "Email not verified!" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging in." });
  }
};
