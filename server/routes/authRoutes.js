import express from "express";
import { body, validationResult } from "express-validator";
import { login, register, refresh, logout } from "../controllers/authController.js";

const router = express.Router();

/**
 * Middleware to handle validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

/**
 * Validation rules for registration
 */
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("upiId").notEmpty().withMessage("UPI ID is required for payouts"),
];

/**
 * Validation rules for login
 */
const loginValidation = [
  body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
