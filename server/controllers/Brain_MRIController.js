// const axios = require("axios");
// const FormData = require("form-data");
// const multer = require("multer");

// const upload = multer({ storage: multer.memoryStorage() });

// exports.uploadMiddleware = upload.single("image");

// // ---------------- CONTROLLER FUNCTION ----------------
// exports.predictImage = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     const form = new FormData();
//     form.append("image", req.file.buffer, {
//       filename: req.file.originalname || "upload.jpg",
//       contentType: req.file.mimetype,
//       knownLength: req.file.size
//     });

//     const flaskURL = "http://127.0.0.1:5000/predict_full";

//     const response = await axios.post(flaskURL, form, {
//       headers: form.getHeaders(),
//       maxContentLength: Infinity,
//       maxBodyLength: Infinity,
//     });

//     return res.status(200).json(response.data);
//   } catch (err) {
//     console.error("Error forwarding to Flask:", err.message);

//     if (err.response && err.response.data) {
//       return res.status(err.response.status).json(err.response.data);
//     }

//     return res.status(500).json({ error: "Error connecting to Flask API" });
//   }
// };



const axios = require("axios");
const FormData = require("form-data");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");

const upload = multer({ storage: multer.memoryStorage() });
exports.uploadMiddleware = upload.single("image");

const formatBrainReport = (api) => {
  const r = api?.report?.report || api?.report || {};

  const tumorType = r.predicted_tumor_type || "N/A";
  const confidence = typeof r.confidence === "number" ? r.confidence : 0;
  const size = r.tumor_size_cm2 || "N/A";
  const stage = r.stage || "N/A";
  const stageExplanation = r.stage_explanation || "No stage explanation available.";

  const treatments =
    Array.isArray(r.treatments) && r.treatments.length > 0
      ? r.treatments
          .map((t) => `| ${t.Stage || "-"} | ${t.Treatment || "-"} | ${t.Explanation || "-"} |`)
          .join("\n")
      : "No treatment data found.";

  return `
===== 🧠 MRI SCAN REPORT =====

📌 Predicted Tumor Type: **${tumorType}**
📊 Prediction Confidence: **${confidence.toFixed(2)}%**

🟦 Estimated Tumor Size: **${size} cm²**

🩸 Suggested Stage: **${stage}**
${stageExplanation}

===============================
🩺 TREATMENT OPTIONS SUMMARY
===============================

| Stage | Treatment | Notes |
|-------|-----------|-------|
${treatments}

📘 Explanation Summary
${stageExplanation}

✅ Report generation complete.
`;
};


exports.predictImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

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

    const model_id = req.body.model_id || req.query.model || "brain";

    const userMessage = {
      type: "user",
      content: "Uploaded Image",
      image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      timestamp: new Date(),
    };

    let conversation = await Conversation.findOne({ userId, model_id }).sort({ createdAt: -1 });
    if (!conversation) {
      conversation = new Conversation({ userId, model_id, messages: [userMessage] });
    } else {
      conversation.messages.push(userMessage);
    }
    await conversation.save();

    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname || "upload.jpg",
      contentType: req.file.mimetype,
      knownLength: req.file.size,
    });

    const flaskURL = "http://127.0.0.1:5000/predict_full";
    const response = await axios.post(flaskURL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const apiData = response.data;
    const gradcam_image = apiData.gradcam_image || null;
    const formattedReport = formatBrainReport(apiData);

    const botMessage = {
      type: "analysis",
      content: formattedReport,
      images: gradcam_image
        ? [{ label: "Brain Tumor", src: `data:image/png;base64,${gradcam_image}` }]
        : [],
      gradcam_images: gradcam_image ? { "Brain Tumor": gradcam_image } : {},
      labels: gradcam_image ? ["Brain Tumor"] : [],
      timestamp: new Date(),
    };

    conversation.messages.push(botMessage);
    await conversation.save();

    res.status(200).json({
      report: formattedReport,
      gradcam_images: botMessage.gradcam_images,
      labels: botMessage.labels,
    });
  } catch (err) {
    console.error("Error in predictImage controller:", err.message);
    res.status(500).json({ error: "Error processing the image" });
  }
};



    exports.getConversation = async (req, res) => {
      try {
        const token = req.cookies?.token;

        if (!token) {
          return res.status(200).json({
            messages: [],
            info: "Guest user - conversation not loaded",
          });
        }

        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          return res.status(200).json({
            messages: [],
            info: "Invalid token - conversation not loaded",
          });
        }

        const userId = decoded.userId;
        const modelId = req.query.model;

        if (!modelId) {
          return res.status(400).json({ error: "Model ID required" });
        }

        const convo = await Conversation.findOne({
          userId,
          model_id: modelId,
        }).sort({ createdAt: -1 });

        if (!convo) {
          return res.status(200).json({
            messages: [],
            info: "No conversation found for this user/model",
          });
        }

        res.status(200).json(convo);
      } catch (err) {
        console.error("Fetch conversation error:", err);
        res.status(500).json({ error: "Server error fetching conversation" });
      }
    };