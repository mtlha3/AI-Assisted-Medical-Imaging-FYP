"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, User, LogOut, Settings, ChevronDown, Menu, X } from "lucide-react"
import api from "../api/api"

const Nav = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const dropdownRef = useRef(null)
  const navRef = useRef(null)

  // ===== AUTH CHECK =====
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me", { withCredentials: true })
      if (res.data.authenticated) {
        setIsAuthenticated(true)
        setUser(res.data.user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (err) {
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "authUpdate") checkAuth()
    }
    window.addEventListener("storage", listener)
    return () => window.removeEventListener("storage", listener)
  }, [])

  useEffect(() => {
    const move = (e) => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect()
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // ===== LOGOUT =====
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true })
      setIsAuthenticated(false)
      setUser(null)
      setIsDropdownOpen(false)
      localStorage.setItem("authUpdate", Date.now())
      window.location.href = "/"
    } catch (err) {
      console.error("Logout failed:", err)
      setIsAuthenticated(false)
      setUser(null)
      window.location.href = "/"
    }
  }

  const handleSettings = () => {
    setIsDropdownOpen(false)
    window.location.href = "/settings"
  }

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Blog", href: "/blogs" },
    { name: "About", href: "/about" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <motion.nav
        ref={navRef}
        className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/30 backdrop-blur-xl sticky top-0 z-[9998] shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              MedDiagnose
            </span>
          </div>
          <div className="text-cyan-400 font-medium flex items-center space-x-2">
            <motion.div
              className="w-3 h-3 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            />
            <span>Loading...</span>
          </div>
        </div>
      </motion.nav>
    )
  }

  // ===== MAIN NAV =====
  return (
    <>
      <motion.nav
        ref={navRef}
        className="relative z-[9998] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/30 backdrop-blur-xl sticky top-0 shadow-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-cyan-500/10 pointer-events-none"
          animate={{
            background: [
              "linear-gradient(to right, rgba(6,182,212,0.1), rgba(16,185,129,0.1), rgba(6,182,212,0.1))",
              "linear-gradient(to right, rgba(16,185,129,0.1), rgba(6,182,212,0.1), rgba(16,185,129,0.1))",
            ],
          }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />

        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />

        <div className="container mx-auto px-6 py-4 relative z-10 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => (window.location.href = "/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
              <Brain className="w-6 h-6 text-white relative z-10" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              AI-Assisted Medical Imaging Diagnosis
            </span>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center space-x-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-slate-300 font-medium overflow-hidden group"
                variants={itemVariants}
                whileHover={{ color: "#06b6d4" }}
              >
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
                {link.name}
              </motion.a>
            ))}
          </motion.div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <motion.div className="relative" ref={dropdownRef} whileHover={{ scale: 1.02 }}>
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/50 rounded-2xl shadow-lg backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-cyan-300">{user?.name}</span>
                  <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="absolute right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl shadow-2xl z-[99999] overflow-visible"
                    >
                      <div className="p-4 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-slate-900" />
                          </div>
                          <div>
                            <p className="font-semibold text-cyan-300">{user?.name}</p>
                            <p className="text-sm text-slate-400">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-red-400 hover:text-red-300 rounded-xl transition-all hover:bg-red-500/10"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => (window.location.href = "/login")}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 font-bold rounded-2xl shadow-lg hover:scale-105 transition-all"
              >
                Login
              </motion.button>
            )}

            <motion.button
              className="md:hidden text-cyan-400 hover:text-cyan-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 space-y-2 border-t border-cyan-500/30 pt-4"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-2 text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-all"
                  whileHover={{ x: 5 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}

export default Nav
