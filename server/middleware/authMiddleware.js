const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
