import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Lock,
  Chrome,
  ArrowRight,
  Activity,
  CheckCircle,
  XCircle,
  X,
  Zap,
  Sparkles,
  Shield,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"
import { auth, googleProvider } from "../firebase"
import { signInWithPopup } from "firebase/auth"

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // ====== ALERT ======
  const showAlert = (message, type = "error") => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 4000)
  }

  // ====== BACKEND SIGNUP ======
  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post("/auth/signup", form)
      showAlert("Account created successfully! Redirecting to login...", "success")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) {
      showAlert(err.response?.data?.message || "Registration failed. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // ====== GOOGLE SIGNUP ======
  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      await api.post("/auth/google", { idToken })
      showAlert("Successfully signed in with Google! Redirecting...", "success")
      setTimeout(() => navigate("/home"), 1500)
    } catch (err) {
      console.error(err)
      showAlert("Google sign-in failed. Please try again.", "error")
    }
  }

  // ====== ANIMATIONS ======
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
  }

  const floatingVariants = { animate: { y: [0, -20, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } } }
  const rotatingVariants = { animate: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" } } }
  const pulseVariants = { animate: { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } } }
  const backgroundBlobVariants = { animate: { scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } } }
  const shineVariants = { animate: { x: ["100%", "-100%"], transition: { duration: 3, repeat: Infinity } } }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center px-4 py-8 overflow-hidden relative">
  
      <motion.div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-10 pointer-events-none blur-3xl" variants={backgroundBlobVariants} animate="animate" />
      <motion.div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full opacity-10 pointer-events-none blur-3xl" variants={backgroundBlobVariants} animate="animate" transition={{ delay: 1 }} />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-emerald-400 rounded-full pointer-events-none"
          animate={{ y: [0, -300, 0], x: [0, Math.random() * 100 - 50, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        />
      ))}

      {alert.show && (
        <motion.div className="fixed top-6 right-6 z-50" initial={{ opacity: 0, x: 100, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 100, scale: 0.8 }}>
          <motion.div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-sm ${
              alert.type === "success"
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-red-500/20 border-red-400 text-red-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {alert.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">{alert.message}</span>
            <motion.button onClick={() => setAlert({ show: false, message: "", type: "" })} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      <motion.div className="relative w-full max-w-6xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
     
          <motion.div className="hidden lg:flex flex-col items-center justify-center relative h-full" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <motion.div className="relative w-64 h-64 mb-8" variants={floatingVariants} animate="animate">
              <motion.div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 border-r-cyan-400 rounded-full" variants={rotatingVariants} animate="animate" />
              <motion.div className="absolute inset-8 border-2 border-emerald-300/30 rounded-full" variants={pulseVariants} animate="animate" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full backdrop-blur-sm"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(16,185,129,0.5)",
                    "0 0 40px rgba(6,182,212,0.5)",
                    "0 0 20px rgba(16,185,129,0.5)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="w-28 h-28 text-emerald-300" />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div className="absolute top-10 left-10 w-16 h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-emerald-400/20" animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <Shield className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <motion.div className="absolute bottom-10 right-10 w-16 h-16 bg-cyan-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-cyan-400/20" animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}>
              <Zap className="w-8 h-8 text-cyan-400" />
            </motion.div>

            <motion.div className="text-center mt-12" variants={containerVariants} initial="hidden" animate="visible">
              <motion.h3 className="text-2xl font-bold text-white mb-3" variants={itemVariants}>
                Join Our Community
              </motion.h3>
              <motion.p className="text-emerald-200 max-w-xs" variants={itemVariants}>
                Get instant access to advanced medical AI insights and join thousands of healthcare professionals.
              </motion.p>

              <motion.div className="flex flex-col gap-3 justify-center mt-6 text-left" variants={containerVariants} initial="hidden" animate="visible">
                {[
                  { icon: "✓", text: "Instant Report Analysis" },
                  { icon: "✓", text: "HIPAA Compliant Security" },
                  { icon: "✓", text: "24/7 Support Access" },
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-400/30 rounded-lg"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(16,185,129,0.2)", borderColor: "rgba(16,185,129,0.6)" }}
                  >
                    <motion.span
                      className="text-emerald-400 font-bold text-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                    >
                      {benefit.icon}
                    </motion.span>
                    <span className="text-emerald-300 text-sm font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <motion.div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-400/20 p-8 lg:p-10 overflow-hidden relative">
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" variants={shineVariants} animate="animate" />

              <motion.div className="relative z-10" variants={containerVariants} initial="hidden" animate="visible">
        
                <motion.div className="text-center mb-10" variants={itemVariants}>
                  <motion.div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl mb-4" variants={floatingVariants} animate="animate">
                    <Activity className="w-7 h-7 text-white" />
                  </motion.div>
                  <motion.h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent mb-2" variants={itemVariants}>
                    Create Account
                  </motion.h2>
                  <motion.p className="text-emerald-200/70 text-sm" variants={itemVariants}>
                    Start your medical AI journey today
                  </motion.p>
                </motion.div>

                <motion.form onSubmit={handleSignup} className="space-y-5" variants={containerVariants}>
              
                  <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                    <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-emerald-400" />
                    </motion.div>
                    <motion.input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      whileFocus={{ boxShadow: "0 0 25px rgba(16,185,129,0.4)", backgroundColor: "rgba(71,85,105,0.7)" }}
                      required
                    />
                  </motion.div>

                  <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                    <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-emerald-400" />
                    </motion.div>
                    <motion.input
                      type="email"
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      whileFocus={{ boxShadow: "0 0 25px rgba(16,185,129,0.4)", backgroundColor: "rgba(71,85,105,0.7)" }}
                      required
                    />
                  </motion.div>

                  <motion.div className="relative group" variants={itemVariants} whileHover={{ scale: 1.02 }}>
                    <motion.div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-emerald-400" />
                    </motion.div>
                    <motion.input
                      type="password"
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-emerald-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-slate-500 text-white"
                      placeholder="Create password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      whileFocus={{ boxShadow: "0 0 25px rgba(16,185,129,0.4)", backgroundColor: "rgba(71,85,105,0.7)" }}
                      required
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
                    <motion.span className="relative" animate={{ opacity: isLoading ? [1, 0.5, 1] : 1 }} transition={{ duration: 1.5, repeat: Infinity }}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </motion.span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.div className="relative my-6" variants={itemVariants}>
                    <div className="absolute inset-0 flex items-center">
                      <motion.div className="w-full border-t border-emerald-500/20" animate={{ scaleX: [0, 1] }} transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-slate-800/50 text-slate-400 font-medium">or continue with</span>
                    </div>
                  </motion.div>

                  <motion.button
                    type="button"
                    onClick={handleGoogle}
                    className="w-full bg-slate-700/50 border border-emerald-400/20 hover:border-emerald-400/40 text-emerald-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 group"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, borderColor: "rgb(16,185,129)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Chrome className="w-5 h-5" />
                    Sign up with Google
                  </motion.button>
                </motion.form>

                <motion.p className="text-xs text-slate-400 text-center mt-6" variants={itemVariants}>
                  By signing up, you agree to our{" "}
                  <motion.button className="text-emerald-400 hover:text-emerald-300 transition-colors" whileHover={{ textDecoration: "underline" }}>
                    Terms of Service
                  </motion.button>
                </motion.p>
              </motion.div>
            </motion.div>

            <motion.div className="text-center mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <p className="text-emerald-200/70">
                Already have an account?{" "}
                <motion.button
                  onClick={() => navigate("/login")}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200"
                  whileHover={{ scale: 1.1, textDecoration: "underline" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign in here
                </motion.button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
