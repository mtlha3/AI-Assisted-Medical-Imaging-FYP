const express = require("express");
const { signup, login, forgotPassword, verifyOTP, googleAuth, logout, me } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/google", googleAuth);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

module.exports = router;
