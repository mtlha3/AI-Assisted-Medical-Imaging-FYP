const express = require("express");
const { uploadMiddleware, predictImage, getConversation } = require("../controllers/Brain_MRIController");

const router = express.Router();

router.post("/predict", uploadMiddleware, predictImage);
router.get("/conversation", getConversation);


module.exports = router;
