"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Activity, CheckCircle, XCircle, X, Zap, Shield } from "lucide-react"
import api from "../api/api"
import { useNavigate } from "react-router-dom"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" })
    }, 4000)
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post("/auth/forgot-password", { email })
      showAlert("OTP sent to your email successfully!", "success")
      setTimeout(() => {
        setStep(2)
        setIsLoading(false)
      }, 1500)
    } catch (err) {
      showAlert(err.response?.data?.message || "Error sending OTP", "error")
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post("/auth/verify-otp", { email, otp, newPassword })
      showAlert("Password reset successful! Redirecting to login...", "success")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      showAlert(err.response?.data?.message || "Error resetting password", "error")
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    },
  }

  const rotatingVariants = {
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    },
  }

  const backgroundBlobVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.3, 0.2],
      transition: { duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
    },
  }

  const shineVariants = {
    animate: {
      x: ["100%", "-100%"],
      transition: { duration: 3, repeat: Number.POSITIVE_INFINITY },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center px-4 py-8 overflow-hidden relative">
  
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-10 pointer-events-none blur-3xl"
        variants={backgroundBlobVariants}
        animate="animate"
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full opacity-10 pointer-events-none blur-3xl"
        variants={backgroundBlobVariants}
        animate="animate"
        transition={{ delay: 1 }}
      />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full pointer-events-none"
          animate={{
            y: [0, -300, 0],
            x: [0, Math.random() * 100 - 50, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 4 + i,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {alert.show && (
        <motion.div
          className="fixed top-6 right-6 z-50"
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
        >
          <motion.div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm ${
              alert.type === "success"
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-red-500/20 border-red-400 text-red-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </motion.div>
            <span className="font-medium">{alert.message}</span>
            <motion.button
              onClick={() => setAlert({ show: false, message: "", type: "" })}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="relative w-full max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      
          <motion.div
            className="hidden lg:flex flex-col items-center justify-center relative h-full"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div className="relative w-64 h-64 mb-8" variants={floatingVariants} animate="animate">
           
              <motion.div
                className="absolute inset-0 border-4 border-transparent border-t-emerald-400 border-r-cyan-400 rounded-full"
                variants={rotatingVariants}
                animate="animate"
              />

              <motion.div
                className="absolute inset-8 border-2 border-emerald-300/30 rounded-full"
                variants={pulseVariants}
                animate="animate"
              />

              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full backdrop-blur-sm"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(16, 185, 129, 0.5)",
                    "0 0 40px rgba(6, 182, 212, 0.5)",
                    "0 0 20px rgba(16, 185, 129, 0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Lock className="w-28 h-28 text-emerald-300" />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute top-10 left-10 w-16 h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-emerald-400/20"
              animate={{
                y: [0, -30, 0],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>

            <motion.div
              className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-cyan-400/20"
              animate={{
                y: [0, 30, 0],
                rotate: [0, -10, 0],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
            >
              <Zap className="w-8 h-8 text-cyan-400" />
            </motion.div>

            <motion.div className="text-center mt-12" variants={containerVariants} initial="hidden" animate="visible">
              <motion.h3 className="text-2xl font-bold text-white mb-3" variants={itemVariants}>
                Secure Reset
              </motion.h3>
              <motion.p className="text-emerald-200 max-w-xs" variants={itemVariants}>
                Your security is our priority. Reset your password safely with our encrypted OTP verification system.
              </motion.p>

              <motion.div
                className="flex flex-col gap-3 justify-center mt-6 text-left"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { icon: "✓", text: "Encrypted OTP Verification" },
                  { icon: "✓", text: "Instant Password Reset" },
                  { icon: "✓", text: "Maximum Security" },
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-400/30 rounded-lg"
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      borderColor: "rgba(16, 185, 129, 0.6)",
                    }}
                  >
                    <motion.span
                      className="text-emerald-400 font-bold text-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: idx * 0.2 }}
                    >
                      {benefit.icon}
                    </motion.span>
                    <span className="text-emerald-300 text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-400/20 p-8 lg:p-10 overflow-hidden relative">
            
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                variants={shineVariants}
                animate="animate"
              />

              <motion.div className="relative z-10" variants={containerVariants} initial="hidden" animate="visible">
                
                <motion.div className="text-center mb-10" variants={itemVariants}>
                  <motion.div
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mb-4"
                    variants={floatingVariants}
                    animate="animate"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <Activity className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent mb-2"
                    variants={itemVariants}
                  >
                    {step === 1 ? "Reset Password" : "Verify & Reset"}
                  </motion.h2>
                  <motion.p className="text-emerald-200/70 text-sm" variants={itemVariants}>
                    {step === 1 ? "Enter your email to receive a reset code" : "Enter the OTP and your new password"}
                  </motion.p>
                </motion.div>

                <motion.div className="flex items-center justify-center gap-2 mb-8" variants={itemVariants}>
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= 1
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                    animate={{ scale: step === 1 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    1
                  </motion.div>
                  <motion.div
                    className={`h-1 w-12 transition-all ${step >= 2 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-700"}`}
                    animate={{ scaleX: step >= 2 ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step >= 2
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                    animate={{ scale: step === 2 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  >
                    2
                  </motion.div>
                </motion.div>

                {step === 1 && (
                  <motion.form
                    onSubmit={handleSendOTP}
                    className="space-y-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                      <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-emerald-400" />
                      </motion.div>
                      <motion.input
                        type="email"
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        whileFocus={{
                          boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                          backgroundColor: "rgba(71, 85, 105, 0.7)",
                        }}
                        required
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 pointer-events-none"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 relative overflow-hidden mt-2"
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                      />
                      <motion.span
                        className="relative"
                        animate={{ opacity: isLoading ? [1, 0.5, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {isLoading ? "Sending OTP..." : "Send Reset Code"}
                      </motion.span>
                      <motion.div
                        className="relative"
                        animate={{ x: isLoading ? 0 : [0, 5, 0] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowLeft className="w-5 h-5 transform rotate-180" />
                      </motion.div>
                    </motion.button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form
                    onSubmit={handleVerifyOTP}
                    className="space-y-5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                      <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-emerald-400" />
                      </motion.div>
                      <motion.input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength="6"
                        whileFocus={{
                          boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                          backgroundColor: "rgba(71, 85, 105, 0.7)",
                        }}
                        required
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 pointer-events-none"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </motion.div>

                    {/* Password Field */}
                    <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                      <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-emerald-400" />
                      </motion.div>
                      <motion.input
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        whileFocus={{
                          boxShadow: "0 0 25px rgba(16, 185, 129, 0.4)",
                          backgroundColor: "rgba(71, 85, 105, 0.7)",
                        }}
                        required
                      />
                      <motion.button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.button>
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 pointer-events-none"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.1 }}
                      />
                    </motion.div>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 relative overflow-hidden mt-2"
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                      />
                      <motion.span
                        className="relative"
                        animate={{ opacity: isLoading ? [1, 0.5, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {isLoading ? "Resetting..." : "Reset Password"}
                      </motion.span>
                      <motion.div
                        className="relative"
                        animate={{ x: isLoading ? 0 : [0, 5, 0] }}
                        transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <ArrowLeft className="w-5 h-5 transform rotate-180" />
                      </motion.div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => {
                        setStep(1)
                        setOtp("")
                        setNewPassword("")
                        setShowPassword(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-emerald-400 hover:text-emerald-300 rounded-xl transition-all border border-emerald-400/30 hover:border-emerald-400/60"
                      variants={itemVariants}
                      whileHover={{ x: -5 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Email
                    </motion.button>
                  </motion.form>
                )}

                <motion.div className="text-center mt-8 border-t border-emerald-400/20 pt-6" variants={itemVariants}>
                  <motion.button
                    onClick={() => navigate("/login")}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200"
                    whileHover={{ scale: 1.1, textDecoration: "underline" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back to Login
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
