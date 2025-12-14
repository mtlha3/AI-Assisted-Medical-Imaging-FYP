'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Bone, Heart, Zap, ArrowRight, Upload, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [hoveredModel, setHoveredModel] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    let animationFrameId
    const handleMouseMove = (e) => {
      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const models = [
    {
      id: 'brain',
      name: 'Brain Tumor Detection',
      description: 'Advanced AI model for detecting and analyzing brain tumors from MRI and CT scans with high accuracy.',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      accentColor: 'text-blue-400',
      borderColor: 'border-blue-400',
      bgGradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      stats: ['98.5% Accuracy', '10K+ Scans Analyzed', 'Real-time Detection'],
    },
    {
      id: 'bone',
      name: 'Bone Fracture Detection',
      description: 'Identify and classify bone fractures from X-ray images instantly with precision AI algorithms.',
      icon: Bone,
      color: 'from-orange-500 to-amber-500',
      accentColor: 'text-orange-400',
      borderColor: 'border-orange-400',
      bgGradient: 'bg-gradient-to-br from-orange-500/10 to-amber-500/10',
      stats: ['97.2% Accuracy', '15K+ X-rays Processed', 'Multi-fracture Support'],
    },
    {
      id: 'heart',
      name: 'Heart ECG Analysis',
      description: 'Analyze electrocardiogram readings to detect cardiac abnormalities and arrhythmias.',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      accentColor: 'text-red-400',
      borderColor: 'border-red-400',
      bgGradient: 'bg-gradient-to-br from-red-500/10 to-pink-500/10',
      stats: ['99.1% Accuracy', '25K+ ECGs Analyzed', '12 Arrhythmia Types'],
    },
    {
      id: 'chest',
      name: 'Chest X-Ray Analysis',
      description: 'Comprehensive chest X-ray analysis for detecting pneumonia, tuberculosis, and other conditions.',
      icon: Zap,
      color: 'from-emerald-500 to-green-500',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-400',
      bgGradient: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10',
      stats: ['96.8% Accuracy', '20K+ Chest X-rays', '50+ Conditions Detected'],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  const handleModelClick = (modelId) => {
    navigate(`/analysis?model=${modelId}`)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/12 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <motion.div
          className="max-w-6xl mx-auto text-center mb-20"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Advanced AI Models</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
              Medical Diagnosis Models
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Choose from our suite of AI-powered diagnostic models to analyze medical images and get instant insights.
          </p>
        </motion.div>

        {/* Models Grid */}
        <motion.div
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {models.map((model, index) => {
            const Icon = model.icon
            return (
              <motion.div
                key={model.id}
                variants={itemVariants}
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
                whileHover={{ y: -10 }}
                className="group cursor-pointer h-full"
                onClick={() => handleModelClick(model.id)}
              >
                <div
                  className={`relative h-full rounded-2xl border-2 ${model.borderColor} ${model.bgGradient} backdrop-blur-sm p-8 overflow-hidden transition-all duration-300`}
                >
                  {/* Background glow */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-0 group-hover:opacity-5 transition-all duration-300`}
                    animate={hoveredModel === model.id ? { opacity: 0.1 } : { opacity: 0 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`mb-6 inline-block p-4 rounded-xl bg-gradient-to-br ${model.color}`}
                    animate={hoveredModel === model.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 ${model.accentColor}`}>{model.name}</h3>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-6 leading-relaxed line-clamp-3">{model.description}</p>

                  {/* Stats */}
                  <div className="space-y-2 mb-6 py-4 border-y border-slate-700">
                    {model.stats.map((stat, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-slate-300"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${model.color}`} />
                        {stat}
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    className={`w-full py-3 px-4 rounded-lg font-semibold bg-gradient-to-r ${model.color} text-slate-950 flex items-center justify-center gap-2 group/btn`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Start Diagnosis</span>
                    <motion.div
                      animate={hoveredModel === model.id ? { x: 3 } : { x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  {/* Border animation */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 ${model.borderColor}`}
                    initial={{ opacity: 0 }}
                    animate={hoveredModel === model.id ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-cyan-400 mb-4">How It Works</h2>
            <p className="text-slate-400">Simple steps to get your diagnosis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Select Model', desc: 'Choose the diagnostic model you need' },
              { step: 2, title: 'Upload Image', desc: 'Upload your medical image or report' },
              { step: 3, title: 'AI Analysis', desc: 'Our AI processes and analyzes' },
              { step: 4, title: 'Get Results', desc: 'Receive instant diagnostic insights' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 border border-cyan-400/30 rounded-xl p-6 text-center h-full">
                  <motion.div
                    className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="font-semibold text-cyan-300 mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>

                {/* Connector line */}
                {idx < 3 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
