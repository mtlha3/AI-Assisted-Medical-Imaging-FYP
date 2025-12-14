import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { Upload, ArrowRight, Zap, Heart, Brain, Activity, X, ChevronLeft, ChevronRight, Star } from "lucide-react"
import api from "../api/api"

export default function Home() {
  const [isHovering, setIsHovering] = useState(false)
  const [fileInputRef, setFileInputRef] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [commentRating, setCommentRating] = useState(0)
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [avgRating, setAvgRating] = useState(0)
  const [carouselIndices, setCarouselIndices] = useState({ info: 0, health: 0, story: 0 })

  const fileInputRefActual = useRef(null)

  // --- Fetch User ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true })
        if (res.data.authenticated) {
          setIsAuthenticated(true)
          setUser(res.data.user)
        }
      } catch (err) {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    fetchUser()
  }, [])

  // --- Fetch Blogs ---
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs/all")
        setBlogs(res.data.blogs || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchBlogs()
  }, [])

  // --- Fetch Comments & Avg Rating for Selected Blog ---
  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedBlog) return
      try {
        const res = await api.get(`/blogs/${selectedBlog.blogId}/comments`, { withCredentials: true })
        setComments(res.data.comments || [])
        setAvgRating(res.data.avgRating || 0)
        // Set user previous rating if exists
        if (res.data.userRating) {
          setCommentRating(res.data.userRating)
        } else {
          setCommentRating(0)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchComments()
  }, [selectedBlog])

  // --- Submit Comment & Rating ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText && commentRating === 0) return

    try {
      await api.post(`/blogs/${selectedBlog.blogId}/comment`, {
        text: commentText || null,
        rating: commentRating || null,
      })
      setCommentText("")

      // Refresh comments & avg rating
      const res = await api.get(`/blogs/${selectedBlog.blogId}/comments`, { withCredentials: true })
      setComments(res.data.comments || [])
      setAvgRating(res.data.avgRating || 0)

      // Refresh blogs (for carousel avg rating display)
      const updatedBlogs = await api.get("/blogs/all")
      setBlogs(updatedBlogs.data.blogs || [])
    } catch (err) {
      alert(err.response?.data?.message || "Please login to comment/rate.")
    }
  }

  // --- Carousel Helpers ---
  const infoBlogs = blogs.filter((b) => b.typeOfBlog === "information")
  const healthTipsBlogs = blogs.filter((b) => b.typeOfBlog === "healthTips")
  const storyBlogs = blogs.filter((b) => b.typeOfBlog === "story")

  const getVisibleCards = (blogArray, startIndex, direction = 1) => {
    const cards = []
    for (let i = 0; i < 3; i++) {
      const index = (startIndex + i * direction) % Math.max(1, blogArray.length)
      cards.push(blogArray[index])
    }
    return cards
  }

  const handleCarouselNext = (section) => {
    const sectionBlogs = section === "info" ? infoBlogs : section === "health" ? healthTipsBlogs : storyBlogs
    setCarouselIndices((prev) => ({
      ...prev,
      [section]: (prev[section] + 1) % Math.max(1, sectionBlogs.length),
    }))
  }

  const handleCarouselPrev = (section) => {
    const sectionBlogs = section === "info" ? infoBlogs : section === "health" ? healthTipsBlogs : storyBlogs
    setCarouselIndices((prev) => ({
      ...prev,
      [section]: prev[section] === 0 ? Math.max(0, sectionBlogs.length - 1) : prev[section] - 1,
    }))
  }

  const sanitizeQuillHtml = (html) => html.replace(/<span class="ql-ui" contenteditable="false"><\/span>/g, "")

  // --- Render Blog Card ---
  const renderBlogCard = (blog) => (
    <motion.div
      key={blog.blogId}
      className="flex-shrink-0 w-96 h-80 rounded-2xl overflow-hidden cursor-pointer group"
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ duration: 0.3 }}
      onClick={() => setSelectedBlog(blog)}
    >
      <div className="relative w-full h-full">
        <img src={blog.image || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.round(blog.avgRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}
              />
            ))}
            <span className="text-sm ml-2">({blog.avgRating?.toFixed(1) || 0})</span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const features = [
    { icon: Brain, text: "AI Analysis", color: "from-blue-400 to-cyan-400" },
    { icon: Heart, text: "Accurate Reports", color: "from-red-400 to-pink-400" },
    { icon: Activity, text: "Real-time Results", color: "from-emerald-400 to-green-400" },
  ]


  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {/* Optimized background */}
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
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20">
          <motion.div className="w-full max-w-5xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30"
              whileHover={{ scale: 1.1 }}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">AI-Powered Medical Intelligence</span>
            </motion.div>

            <motion.h1
              className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 bg-clip-text text-transparent">
                Diagnose Smarter
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Heal Faster
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Upload medical reports and receive instant AI-powered insights.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {/* Upload Report → /dashboard */}
              <motion.button
                className="px-10 py-5 rounded-xl font-bold text-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = "/dashboard"}
              >
                <div className="flex items-center justify-center gap-3">
                  <Upload className="w-6 h-6" />
                  <span>Upload Report</span>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </motion.button>

              {/* Explore Feature → About Project → /about */}
              <motion.button
                className="px-10 py-5 rounded-xl font-bold text-lg border-2 border-cyan-400 text-cyan-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = "/about"}
              >
                About Project
              </motion.button>
            </motion.div>


            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl border border-cyan-400/20 backdrop-blur-sm"
                  whileHover={{ y: -5 }}
                >
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${feature.color} w-fit mx-auto mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-200 font-semibold">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Blog Sections with Carousels */}
        <div className="max-w-7xl mx-auto px-4 py-24 space-y-24">
          {/* Information Blogs Section */}
          {infoBlogs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-cyan-400 mb-8">Featured Blogs</h2>
              <div className="relative group">
                <div className="flex justify-center items-center">
                  <motion.div
                    className="flex gap-6 justify-center"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, mass: 1 }}
                    layout
                  >
                    {getVisibleCards(infoBlogs, carouselIndices.info, 1).map((blog) => renderBlogCard(blog))}
                  </motion.div>
                </div>

                <motion.button
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselPrev("info")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <motion.button
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselNext("info")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Health Tips Section */}
          {healthTipsBlogs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-emerald-400 mb-8">Health Tips</h2>
              <div className="relative group">
                <div className="flex justify-center items-center">
                  <motion.div
                    className="flex gap-6 justify-center flex-row-reverse"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, mass: 1 }}
                    layout
                  >
                    {getVisibleCards(healthTipsBlogs, carouselIndices.health, 1).map((blog) => renderBlogCard(blog))}
                  </motion.div>
                </div>

                <motion.button
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselPrev("health")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <motion.button
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselNext("health")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Stories Section */}
          {storyBlogs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-pink-400 mb-8">Success Stories</h2>
              <div className="relative group">
                <div className="flex justify-center items-center">
                  <motion.div
                    className="flex gap-6 justify-center"
                    animate={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, mass: 1 }}
                    layout
                  >
                    {getVisibleCards(storyBlogs, carouselIndices.story, 1).map((blog) => renderBlogCard(blog))}
                  </motion.div>
                </div>

                <motion.button
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselPrev("story")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <motion.button
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full bg-pink-500/20 border border-pink-400/50 text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCarouselNext("story")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBlog(null)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl w-full max-w-screen-2xl h-[calc(100vh-150px)] overflow-hidden grid grid-cols-1 md:grid-cols-4 border border-cyan-400/30 z-50"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image */}
              <div className="relative hidden md:flex md:col-span-2 flex-shrink-0 overflow-hidden">
                <img src={selectedBlog.image || "/placeholder.svg"} alt={selectedBlog.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/40" />
              </div>

              {/* Middle: Blog Details */}
              <div className="md:col-span-1 p-8 overflow-y-auto flex flex-col border-r border-slate-700">
                <h2 className="text-2xl font-bold text-cyan-300 mb-3 line-clamp-4">{selectedBlog.title}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={i < Math.round(avgRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400 text-sm">({avgRating?.toFixed(1) || 0})</span>
                </div>
                <p className="text-slate-400 text-sm mb-2">📅 {new Date(selectedBlog.date).toLocaleDateString()}</p>
                <p className="text-slate-400 text-sm mb-4">✍️ By {selectedBlog.userId || "Anonymous"}</p>
                <div
                  className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizeQuillHtml(selectedBlog.description) }}
                />
              </div>

              {/* Right: Comments */}
              <div className="md:col-span-1 p-8 overflow-y-auto flex flex-col border-l border-slate-700">
                <motion.button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white z-50"
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={24} />
                </motion.button>

                <h3 className="text-lg font-semibold text-cyan-300 mb-4">Comments & Ratings</h3>

                {isAuthenticated ? (
                  <form onSubmit={handleCommentSubmit} className="mb-4 space-y-3 flex-shrink-0">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400 outline-none transition text-sm"
                      rows="3"
                    />

                    <div className="flex gap-1 items-center">
                      <span className="text-slate-400 text-sm">Rate:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          type="button"
                          onClick={() => setCommentRating(star)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Star
                            size={18}
                            className={star <= commentRating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                          />
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold py-2 rounded-lg hover:opacity-90 transition text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Submit
                    </motion.button>
                  </form>
                ) : (
                  <p className="text-slate-400 text-sm mb-4 flex-shrink-0">Please login to comment or rate.</p>
                )}

                <div className="space-y-3 overflow-y-auto flex-1">
                  {comments.length === 0 ? (
                    <p className="text-slate-500 text-sm">No comments yet. Be the first!</p>
                  ) : (
                    comments.map((c) => (
                      <motion.div
                        key={c.commentId}
                        className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p className="font-semibold text-cyan-300 text-sm">{c.userName}</p>
                        {c.text && <p className="text-slate-300 text-xs mt-1">{c.text}</p>}
                        {c.rating != null && (
                          <div className="flex gap-1 mt-2">
                            {[...Array(c.rating)].map((_, i) => (
                              <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                        <p className="text-slate-500 text-xs mt-2">{new Date(c.date).toLocaleString()}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
