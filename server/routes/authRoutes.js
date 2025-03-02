const express = require("express");
const { signup, verifyEmail, login } = require("../controllers/authController");
const { body } = require("express-validator");

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  signup
);

router.post("/verify-email", [body("email").isEmail(), body("code").isLength({ min: 6, max: 6 })], verifyEmail);

router.post("/login", login);

module.exports = router;
