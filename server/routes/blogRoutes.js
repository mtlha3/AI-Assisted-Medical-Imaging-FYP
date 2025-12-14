const express = require("express");
const router = express.Router();
const { createBlog, uploadBlogImage, updateBlog, deleteBlog, getBlogsByUser, getAllBlogs,
    addCommentOrRating, getBlogComments
 } = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware ,uploadBlogImage ,createBlog);
router.put("/update/:blogId", authMiddleware, uploadBlogImage, updateBlog);
router.delete("/delete/:blogId", authMiddleware, deleteBlog);
router.get("/user", authMiddleware, getBlogsByUser);
router.get("/all", getAllBlogs);
router.post("/:blogId/comment", authMiddleware ,addCommentOrRating);
router.get("/:blogId/comments", getBlogComments);

module.exports = router;
