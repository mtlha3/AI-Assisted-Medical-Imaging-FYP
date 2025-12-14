const axios = require("axios");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Conversation = require("../models/Conversation");

exports.predictBoneFracture = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No image uploaded" });

    let userId = "guest_user";
    const token = req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.userId) userId = decoded.userId;
      } catch (err) {
        console.log("Invalid token, using guest user");
      }
    }

    const model_id = req.body.model_id || req.query.model || "bone_fracture";

    const xrayPath = `/uploads/${req.file.filename}`;

    const userMessage = {
      type: "user",
      content: "Uploaded Bone Fracture X-ray",
      image: xrayPath, 
      timestamp: new Date(),
      labels: [],
      images: [],
      gradcam_images: {},
    };

    let conversation = await Conversation.findOne({ userId, model_id })
      .sort({ createdAt: -1 });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        model_id,
        messages: [userMessage],
      });
    } else {
      conversation.messages.push(userMessage);
    }

    await conversation.save();

    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path), {
      filename: req.file.filename,
      contentType: req.file.mimetype,
    });

    const flaskURL = "http://127.0.0.1:5000/predict-bone";

    const response = await axios.post(flaskURL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const { label, probability, gradcam_image } = response.data;

    let gradcamObj = null;
    if (gradcam_image) {
      const gradcamBuffer = Buffer.from(gradcam_image, "base64");
      const gradcamFileName = `${Date.now()}-gradcam.png`;
      const gradcamPath = path.join(__dirname, "../uploads", gradcamFileName);
      fs.writeFileSync(gradcamPath, gradcamBuffer);

      gradcamObj = {
        label,
        src: `/uploads/${gradcamFileName}`,
      };
    }

    let formattedReport = `# 🦴 Bone Fracture X-ray Report\n\n`;

    if (label === "Fracture") {
      formattedReport += `### ⚠️ **Fracture Detected**  
Probability: **${(probability * 100).toFixed(2)}%**`;
    } else {
      formattedReport += `### ✅ **No Fracture Detected**  
Probability: **${(probability * 100).toFixed(2)}%**`;
    }

    const botMessage = {
      type: "analysis",
      content: formattedReport,
      images: gradcamObj ? [gradcamObj] : [],
      gradcam_images: gradcamObj ? { [label]: gradcamObj.src } : {},
      labels: [label],
      timestamp: new Date(),
      confidence: probability,
    };

    conversation.messages.push(botMessage);
    await conversation.save();

    return res.status(200).json({
      report: formattedReport,
      label,
      probability,
      xray_image: xrayPath,
      gradcam_image: gradcamObj,
    });

  } catch (err) {
    console.error("Error in predictBoneFracture controller:", err);
    res.status(500).json({ error: "Error processing bone fracture X-ray" });
  }
};
