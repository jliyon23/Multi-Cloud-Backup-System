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
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`, // Use backticks for template literals
    });
    console.log("Verification email sent to:", email); // Log success
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Don't expose error details to the client; log them.
  }
};

// Signup Route
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationcode: verificationCode,
      verified: false, // Ensure user is initially not verified
    });
    console.log("New user created:", user.email); // Log success

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({ message: "Signup successful! Check your email for the verification code." });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });  // Generic error
  }
};

// Verify Email with 6-Digit Code
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid request" });  // Generic error
    }

    if (user.verified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    if (user.verificationcode !== code) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    user.verificationcode = null;
    user.verified = true;
    await user.save();


    res.json({ message: "Email verified successfully!" });

  } catch (err) {
    console.error("Error during email verification:", err);
    res.status(500).json({ error: "Verification failed. Please try again." }); // Generic error
  }
};

// Login Route
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." }); // Generic error
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials." });  // Generic error
    }

    if (!user.verified) {
      return res.status(401).json({ error: "Email not verified. Please check your inbox." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed. Please try again." }); // Generic error
  }
};