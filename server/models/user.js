const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, default: null },

  resetOTP: String,
  resetOTPExpire: Date,
});

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model("User", userSchema);
