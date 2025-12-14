const express = require("express");
const router = express.Router();
const multer = require("multer");
const { predictLungsImage } = require("../controllers/LungsXrays.js");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/predict-lungs", upload.single("image"), predictLungsImage);

module.exports = router;
