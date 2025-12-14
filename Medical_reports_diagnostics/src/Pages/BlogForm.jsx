"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../api/api"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"
import { Plus, X, Heart, Share2, MessageCircle, Trash2, Edit, Upload, BookOpen } from "lucide-react"

const BlogPage = () => {
  const [blogs, setBlogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    typeOfBlog: "information",
    image: null,
  })
  const [message, setMessage] = useState("")
  const [cardIndices, setCardIndices] = useState({})

  const handleImageChange = (e) => setFormData({ ...formData, image: e.target.files[0] })

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleQuillChange = (value) => setFormData({ ...formData, description: value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      setMessage("Title and description are required.")
      return
    }

    try {
      const data = new FormData()
      data.append("title", formData.title)
      data.append("description", formData.description)
      data.append("typeOfBlog", formData.typeOfBlog)
      if (formData.image) data.append("image", formData.image)

      let res
      if (editingBlog) {
        res = await api.put(`/blogs/update/${editingBlog.blogId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setMessage(res.data.message)
        setEditingBlog(null)
      } else {
        res = await api.post("/blogs/create", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        setMessage(res.data.message)
      }

      setFormData({
        title: "",
        description: "",
        typeOfBlog: "information",
        image: null,
      })
      setShowForm(false)
      fetchBlogs()
    } catch (err) {
      console.error("Error:", err.response || err)
      setMessage(err.response?.data?.message || "Error submitting blog")
    }
  }

  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      title: blog.title,
      description: blog.description,
      typeOfBlog: blog.typeOfBlog,
      image: null,
    })
    setShowForm(true)
    setSelectedBlog(null)
  }

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return
    try {
      const res = await api.delete(`/blogs/delete/${blogId}`)
      alert(res.data.message)
      setSelectedBlog(null)
      fetchBlogs()
    } catch (err) {
      console.error("Error deleting blog:", err.response || err)
      alert(err.response?.data?.message || "Error deleting blog")
    }
  }

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs/user")
      setBlogs(res.data.blogs)
      const indices = {}
      res.data.blogs.forEach((_, i) => {
        indices[i] = 0
      })
      setCardIndices(indices)
    } catch (err) {
      console.error("Error fetching blogs:", err)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }

  const quillFormats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "align", "link", "image"]

  const deckCardVariants = (index) => ({
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 0,
      rotateZ: 0,
    },
    animate: (custom) => {
      if (custom >= 3) {
        return {
          opacity: 0,
          scale: 0.9,
          y: 500,
          rotateZ: 0,
          zIndex: -1,
          transition: { duration: 0.3 },
        }
      }

      return {
        opacity: 1,
        scale: 1 - custom * 0.08,
        y: custom * 24,
        x: custom * -12, // changed to negative to shift cards left instead of right
        rotateZ: custom * -5, // changed to negative rotation for top-left tilt
        zIndex: 100 - custom,
        transition: {
          duration: 0.4,
          type: "spring",
          stiffness: 250,
          damping: 25,
        },
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -200,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  })

  const handleCardSwipe = (direction) => {
    if (blogs.length <= 1) return

    setBlogs((prev) => {
      const newBlogs = [...prev]
      const card = newBlogs.shift()
      newBlogs.push(card)
      return newBlogs
    })
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full pointer-events-none"
        animate={{
          x: [0, 30, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full pointer-events-none"
        animate={{
          x: [0, 20, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full pointer-events-none"
          animate={{
            y: [0, -150, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 1,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="relative z-10">
        <div className="flex items-center justify-between px-6 lg:px-12 py-8 border-b border-cyan-400/10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <motion.h1
              className="text-4xl font-black bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              My Blogs
            </motion.h1>
          </motion.div>

          <motion.button
            onClick={() => {
              setEditingBlog(null)
              setFormData({
                title: "",
                description: "",
                typeOfBlog: "information",
                image: null,
              })
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 relative overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
            />
            <Plus className="w-5 h-5 relative" />
            <span className="relative">Add Blog</span>
          </motion.button>
        </div>

        <div className="px-6 lg:px-12 py-12 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
          {blogs.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center gap-6 py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-400/30"
              >
                <BookOpen className="w-16 h-16 text-cyan-400" />
              </motion.div>
              <p className="text-xl text-slate-400">No blogs yet. Create your first blog!</p>
            </motion.div>
          ) : (
            <div className="w-full max-w-2xl">
              <motion.div
                className="relative h-[600px] w-full perspective cursor-grab active:cursor-grabbing"
                whileDrag={{ cursor: "grabbing" }}
              >
                <AnimatePresence mode="wait">
                  {blogs.map((blog, index) => (
                    <motion.div
                      key={blog.blogId}
                      custom={index}
                      variants={deckCardVariants(index)}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      drag={index === 0 ? true : false}
                      dragElastic={0.15}
                      dragTransition={{ power: 0.2, restDelta: 10 }}
                      onDragEnd={(e, info) => {
                        const threshold = 80
                        if (Math.abs(info.offset.x) > threshold) {
                          handleCardSwipe(info.offset.x > 0 ? "right" : "left")
                        }
                      }}
                      className="absolute w-full h-full"
                      style={{
                        pointerEvents: index === 0 ? "auto" : "none",
                        originX: 0.5,
                        originY: 0.5,
                      }}
                    >
                      <motion.div
                        className="h-full rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-cyan-400/30 backdrop-blur-xl p-8 flex flex-col justify-between overflow-hidden relative"
                        whileHover={{ borderColor: "rgba(34, 197, 94, 0.8)" }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                          animate={{ x: ["100%", "-100%"] }}
                          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
                        />

                        {blog.image && (
                          <motion.div
                            className="mb-6 rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 relative z-10 cursor-pointer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => setSelectedBlog(blog)}
                          >
                            <img
                              src={blog.image || "/placeholder.svg"}
                              alt={blog.title}
                              className="w-full h-full object-contain" // changed from object-cover to object-contain to show full image
                            />
                          </motion.div>
                        )}

                        <div className="flex-1 relative z-10">
                          <motion.h2
                            className="text-2xl font-bold text-white mb-2 line-clamp-2 cursor-pointer hover:text-cyan-300 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            onClick={() => setSelectedBlog(blog)}
                          >
                            {blog.title}
                          </motion.h2>

                          <motion.div
                            className="flex items-center gap-3 mb-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                          >
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                              {blog.typeOfBlog}
                            </span>
                            <span className="text-sm text-slate-400">{new Date(blog.date).toLocaleDateString()}</span>
                          </motion.div>

                          <motion.div
                            className="text-slate-300 text-sm line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: blog.description.substring(0, 150) + "...",
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          />
                        </div>

                        <motion.div
                          className="mt-6 pt-6 border-t border-cyan-400/20 flex items-center justify-between relative z-10"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.25 }}
                        >
                          <div className="flex gap-4">
                            <motion.button
                              className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Heart className="w-4 h-4" />
                              <span className="text-xs font-medium">{blog.rating || 0}</span>
                            </motion.button>
                            <motion.button
                              className="flex items-center gap-2 text-slate-400 hover:text-emerald-300 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">View</span>
                            </motion.button>
                            <motion.button
                              className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Share2 className="w-4 h-4" />
                              <span className="text-xs font-medium">Share</span>
                            </motion.button>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(blog)
                              }}
                              className="p-2 bg-amber-500/30 hover:bg-amber-500/50 rounded-lg transition-colors text-amber-300"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              title="Edit blog"
                            >
                              <Edit className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(blog.blogId)
                              }}
                              className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors text-red-300"
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              title="Delete blog"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {blogs.length > 1 && (
                <motion.p
                  className="text-center text-slate-400 text-sm mt-12"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  ← Drag to see more blogs →
                </motion.p>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl border border-cyan-400/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative mt-24"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-6 right-6 z-10 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors"
                onClick={() => setShowForm(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-slate-300" />
              </motion.button>

              <motion.div className="relative z-10 p-8">
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                    {editingBlog ? "Edit Your Blog" : "Create a New Blog"}
                  </h2>
                  <p className="text-slate-300">Share your medical insights and expertise</p>
                </motion.div>

                {message && (
                  <motion.div
                    className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-400/50 text-red-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {message}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Blog Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter an engaging title..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-500 text-white"
                    />
                  </motion.div>

                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Blog Type</label>
                    <select
                      name="typeOfBlog"
                      value={formData.typeOfBlog}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-400/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    >
                      <option value="information">Information</option>
                      <option value="healthTips">Health Tips</option>
                      <option value="story">Story</option>
                    </select>
                  </motion.div>

                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Description</label>
                    <div className="bg-slate-700/50 rounded-xl overflow-hidden border border-cyan-400/20 focus-within:ring-2 focus-within:ring-cyan-500 quill-white-theme">
                      <style>{`
                        .quill-white-theme .ql-toolbar {
                          background-color: rgba(51, 65, 85, 0.5) !important;
                          border: none !important;
                        }
                        .quill-white-theme .ql-toolbar.ql-snow .ql-picker-label,
                        .quill-white-theme .ql-toolbar.ql-snow .ql-stroke,
                        .quill-white-theme .ql-toolbar.ql-snow .ql-fill {
                          color: white !important;
                        }
                        .quill-white-theme .ql-toolbar.ql-snow .ql-picker {
                          color: white !important;
                        }
                        .quill-white-theme .ql-editor {
                          min-height: 200px;
                          color: white !important;
                        }
                        .quill-white-theme .ql-editor.ql-blank::before {
                          color: rgba(148, 163, 184, 0.7) !important;
                        }
                      `}</style>
                      <ReactQuill
                        value={formData.description}
                        onChange={handleQuillChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Write your blog description here..."
                        theme="snow"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    className="relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">Blog Image</label>
                    <motion.label
                      className="flex items-center justify-center gap-3 px-4 py-4 bg-slate-700/50 border-2 border-dashed border-cyan-400/30 rounded-xl cursor-pointer hover:border-cyan-400/60 transition-colors"
                      whileHover={{ borderColor: "rgba(34, 197, 94, 0.6)" }}
                    >
                      <Upload className="w-5 h-5 text-cyan-400" />
                      <span className="text-slate-300">
                        {formData.image ? formData.image.name : "Click to upload image"}
                      </span>
                      <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
                    </motion.label>
                  </motion.div>

                  <motion.div
                    className="flex gap-4 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <motion.button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                      />
                      <span className="relative">{editingBlog ? "Update Blog" : "Publish Blog"}</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-3 bg-slate-700/50 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-slate-600 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl border border-cyan-400/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative mt-24"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                className="absolute top-6 right-6 z-10 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-colors"
                onClick={() => setSelectedBlog(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-slate-300" />
              </motion.button>

              <motion.div className="relative z-10 p-8">
                {selectedBlog.image && (
                  <motion.div
                    className="mb-6 rounded-2xl overflow-hidden h-80 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src={selectedBlog.image || "/placeholder.svg"}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}

                <motion.h2
                  className="text-3xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  {selectedBlog.title}
                </motion.h2>

                <motion.div
                  className="flex items-center justify-between mb-6 pb-6 border-b border-cyan-400/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="flex gap-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                      {selectedBlog.typeOfBlog}
                    </span>
                    <span className="text-sm text-slate-400">{new Date(selectedBlog.date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-400">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{selectedBlog.rating || 0}</span>
                  </div>
                </motion.div>

                <motion.div
                  className="blog-content max-w-none mb-8 text-slate-300 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.description }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                />

                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <motion.button
                    onClick={() => handleEdit(selectedBlog)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="w-5 h-5" />
                    <span>Edit</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(selectedBlog.blogId)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlogPage
