const express = require("express");
const { signup, verifyEmail, login } = require("../controllers/authController");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().escape().withMessage("Name is required"), // Added trim and escape
    body("email").isEmail().normalizeEmail().withMessage("Invalid email"), // Added normalizeEmail
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"), // Increased min length
  ],
  signup
);

router.post(
  "/verify-email",
  [
    body("email").isEmail().normalizeEmail(), // Added normalizeEmail
    body("code").isLength({ min: 6, max: 6 }).withMessage("Invalid verification code"), // Added message
  ],
  verifyEmail
);

router.post("/login", [
    body("email").isEmail().normalizeEmail(), // Added normalizeEmail
    body("password").notEmpty().withMessage("Password is required")
], login);

module.exports = router;