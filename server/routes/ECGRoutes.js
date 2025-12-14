const express = require("express");
const router = express.Router();
const multer = require("multer");
const { predictECGImage } = require("../controllers/ECGcontroller");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/predict-ecg", upload.single("image"), predictECGImage);

module.exports = router;
