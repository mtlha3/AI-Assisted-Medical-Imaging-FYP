const Blog = require("../models/blog");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const jwt = require("jsonwebtoken");


// Upload middleware
const storage = multer.memoryStorage();
const upload = multer({ storage });
exports.uploadBlogImage = upload.single("image");

// CREATE BLOG (already implemented)
exports.createBlog = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found." });

    const { title, description, rating, typeOfBlog } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description are required." });

    const newBlog = new Blog({
      blogId: uuidv4(),
      userId,
      title,
      description,
      rating: 0,
      typeOfBlog: typeOfBlog || "information",
      date: new Date(),
    });

    if (req.file) {
      newBlog.image.data = req.file.buffer;
      newBlog.image.contentType = req.file.mimetype;
    }

    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully.", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error while creating blog." });
  }
};

// UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const userId = req.userId;
    const { blogId } = req.params;
    const { title, description, rating, typeOfBlog } = req.body;

    const blog = await Blog.findOne({ blogId, userId });
    if (!blog) return res.status(404).json({ message: "Blog not found or you are not authorized." });

    if (title) blog.title = title;
    if (description) blog.description = description;
    if (rating !== undefined) blog.rating = rating;
    if (typeOfBlog) blog.typeOfBlog = typeOfBlog;

    if (req.file) {
      blog.image.data = req.file.buffer;
      blog.image.contentType = req.file.mimetype;
    }

    await blog.save();
    res.status(200).json({ message: "Blog updated successfully.", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error while updating blog." });
  }
};

// DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const userId = req.userId;
    const { blogId } = req.params;

    const blog = await Blog.findOneAndDelete({ blogId, userId });
    if (!blog) return res.status(404).json({ message: "Blog not found or you are not authorized." });

    res.status(200).json({ message: "Blog deleted successfully.", blog });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error while deleting blog." });
  }
};


// GET BLOGS BY USER
exports.getBlogsByUser = async (req, res) => {
  try {
    const userId = req.userId;
    const blogs = await Blog.find({ userId }).sort({ date: -1 });

    const blogsWithImages = blogs.map(blog => {
      let image = null;
      if (blog.image && blog.image.data) {
        image = `data:${blog.image.contentType};base64,${blog.image.data.toString('base64')}`;
      }
      return {
        ...blog.toObject(),
        image
      };
    });

    res.status(200).json({ message: "User blogs fetched successfully.", blogs: blogsWithImages });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    res.status(500).json({ message: "Server error while fetching user blogs." });
  }
};

// GET ALL BLOGS

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });

    const blogsWithImagesAndRating = blogs.map((blog) => {
      let image = null;
      if (blog.image && blog.image.data) {
        image = `data:${blog.image.contentType};base64,${blog.image.data.toString('base64')}`;
      }

      const ratings = blog.ratings?.map(r => r.rating) || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      return {
        ...blog.toObject(),
        image,
        avgRating,
      };
    });

    res.status(200).json({ message: "All blogs fetched successfully.", blogs: blogsWithImagesAndRating });
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    res.status(500).json({ message: "Server error while fetching all blogs." });
  }
};




// Add comment or rating to a blog
exports.addCommentOrRating = async (req, res) => {
  try {
    const { blogId } = req.params;
    let { text, rating } = req.body;

    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Please login to comment or rate" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const userName = user.name;

    const blog = await Blog.findOne({ blogId });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (text) {
      blog.comments.push({
        commentId: uuidv4(),
        userId,
        userName,
        text,
      });
    }

    // Add or update rating
    if (rating != null) {
      rating = Number(rating);
      if (isNaN(rating)) return res.status(400).json({ message: "Rating must be a number" });
      if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });

      blog.ratings = blog.ratings || [];
      const existingIndex = blog.ratings.findIndex(r => r.userId === userId);
      if (existingIndex > -1) {
        blog.ratings[existingIndex].rating = rating;
      } else {
        blog.ratings.push({ userId, rating });
      }

      const allRatings = blog.ratings.map(r => r.rating);
      blog.rating = Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10; 
    }

    await blog.save();
    res.status(201).json({ message: "Feedback added", avgRating: blog.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





// Fetch comments and average rating for a blog (public)
exports.getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const token = req.cookies?.token;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch {
        userId = null;
      }
    }

    const blog = await Blog.findOne({ blogId });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comments = blog.comments.map(c => ({
      commentId: c.commentId,
      userId: c.userId,
      userName: c.userName,
      text: c.text || null,
      date: c.date,
    }));

    const userRating =
      userId && blog.ratings
        ? blog.ratings.find(r => r.userId === userId)?.rating || null
        : null;

    res.status(200).json({
      comments,
      avgRating: blog.rating, 
      userRating,            
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
