import express from "express";
import { body, validationResult } from "express-validator";
import { login, register, refresh, logout } from "../controllers/authController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Rider:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         upiId:
 *           type: string
 *         phone:
 *           type: string
 */

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

const registerValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("upiId").notEmpty().withMessage("UPI ID is required for payouts"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Provide a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new rider
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rider'
 *     responses:
 *       201:
 *         description: Rider registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", registerValidation, validate, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for riders
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", loginValidation, validate, login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post("/logout", logout);

export default router;
