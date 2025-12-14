const express = require("express");
const router = express.Router();
const multer = require("multer");
const BoneFractureController = require("../controllers/BoneFractureController");

const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); 
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post(
  "/predict-bone",
  upload.single("image"),
  BoneFractureController.predictBoneFracture
);

module.exports = router;
