const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const admin = require("../db/firebaseAdmin");
const sendEmail = require("../utils/sendEmail");

// 4 letters + 4 numbers
function generateUserId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) id += letters[Math.floor(Math.random() * letters.length)];
  id += Math.floor(1000 + Math.random() * 9000);
  return id;
}

// Signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const userId = generateUserId();
        user = await User.create({ userId, name, email, password });

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await require("bcryptjs").compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({ message: "Logged in successfully", userId: user.userId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//Google Auth
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "Missing idToken" });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, email_verified } = decoded;

    if (!email) return res.status(400).json({ message: "Google account has no email" });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        userId: generateUserId(),
        name: name || email.split("@")[0],
        email,
        password: crypto.randomBytes(20).toString("hex"),
        provider: "google",
        googleId: uid,
      });
    } else {
      if (!user.googleId) user.googleId = uid;
      if (user.provider !== "google") user.provider = "google";
      await user.save();
    }

    const token = jwt.sign({ id: user.userId}, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Google login successful", userId: user.userId });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google auth failed" });
  }
};



// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        await sendEmail({
            email: user.email,
            subject: "Password Reset OTP",
            message: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
        });

        res.json({ message: "OTP sent to your email" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Reset Password
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({
            email,
            resetOTP: otp,
            resetOTPExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        user.password = newPassword;
        user.resetOTP = undefined;
        user.resetOTPExpire = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.json({ message: "Logged out successfully" });
};



exports.me = async (req, res) => {
  try {
    const token = req.cookies?.token; 
    if (!token) {
      return res.json({ authenticated: false, message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      authenticated: true,
      userId: decoded.id,
      message: "User is logged in",
    });
  } catch (err) {
    return res.json({
      authenticated: false,
      message: "Invalid or expired token",
    });
  }
};