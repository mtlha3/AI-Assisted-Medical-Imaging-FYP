"use client"

import { motion } from "framer-motion"
import { Users, Award, Zap, Shield, Brain, Heart } from "lucide-react"

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Diagnosis",
      description:
        "Integrating four advanced AI models for comprehensive medical image analysis including brain MRI, bone X-ray, chest X-ray, and ECG analysis.",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: Shield,
      title: "User-Friendly Interface",
      description:
        "Intuitive platform allowing users to select appropriate models, upload medical images, and receive instant diagnostic results.",
      color: "from-emerald-500 to-cyan-400",
    },
    {
      icon: Zap,
      title: "Input Validation",
      description:
        "Robust system ensuring diagnostic accuracy by rejecting invalid or incompatible inputs before processing.",
      color: "from-cyan-500 to-blue-400",
    },
  ]

  const teamMembers = [
    {
      name: "Muhammad Talha",
      id: "02-134221-071",
      role: "Team Member",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      name: "Ammad Hameed",
      id: "02-134221-084",
      role: "Team Member",
      gradient: "from-emerald-500 to-cyan-500",
    },
    {
      name: "M Faizan Raza",
      id: "02-134221-083",
      role: "Team Member",
      gradient: "from-blue-500 to-emerald-500",
    },
  ]

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Heart className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">About Our Project</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                AI-Assisted Medical
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Image Diagnosis
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-12">
              A comprehensive web application leveraging advanced artificial intelligence to provide accurate and
              instant medical image analysis across multiple diagnostic domains.
            </p>
          </motion.div>

          {/* Features Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="group h-full p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-300">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-slate-950" />
                  </div>
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Project Details Section */}
          <motion.div
            className="mb-20 p-12 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-400/30"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                <Zap className="w-6 h-6 text-slate-950" />
              </div>
              <h2 className="text-3xl font-bold text-cyan-300">Diagnostic Models</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "Brain Tumor Detection", icon: "🧠" },
                { name: "Bone Fracture Analysis", icon: "🦴" },
                { name: "Chest X-Ray Diagnosis", icon: "📋" },
                { name: "ECG Arrhythmia Detection", icon: "❤️" },
              ].map((model, idx) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 text-center hover:border-cyan-400/50 transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl mb-3">{model.icon}</div>
                  <p className="text-slate-300 font-medium">{model.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div className="mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Users className="w-6 h-6 text-slate-950" />
              </div>
              <h2 className="text-3xl font-bold text-emerald-300">Team Members</h2>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {teamMembers.map((member, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <motion.div
                    className={`p-8 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 h-full hover:border-emerald-400/50 transition-all duration-300`}
                    whileHover={{ y: -10 }}
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-br ${member.gradient} mb-6 flex items-center justify-center`}
                    >
                      <span className="text-2xl font-bold text-slate-950">{member.name.charAt(0)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-200 mb-2">{member.name}</h3>
                    <p className="text-cyan-400 font-semibold mb-3">{member.id}</p>
                    <p className="text-slate-400">{member.role}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Supervisor Section */}
          <motion.div
            className="p-12 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-emerald-400/30 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
                <Award className="w-6 h-6 text-slate-950" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-emerald-300 mb-2">Project Supervisor</h3>
            <p className="text-2xl font-semibold text-slate-200">Dr. Raheel Siddiqi</p>
            <p className="text-slate-400 mt-4">Guiding innovation in AI-powered medical diagnostics</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
