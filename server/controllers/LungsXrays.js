// const axios = require("axios");
// const FormData = require("form-data");
// const jwt = require("jsonwebtoken");
// const Conversation = require("../models/Conversation");

// exports.predictLungsImage = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: "No image uploaded" });

//     let userId = "guest_user";
//     const token = req.cookies?.token;
//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         if (decoded.userId) userId = decoded.userId;
//       } catch (err) {
//         console.log("Invalid token, using guest user");
//       }
//     }

//     const model_id = req.body.model_id || req.query.model || "lungs";

//     const userMessage = {
//       type: "user",
//       content: "Uploaded Lung X-ray",
//       image: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
//       timestamp: new Date(),
//     };

//     let conversation = await Conversation.findOne({ userId, model_id }).sort({ createdAt: -1 });

//     if (!conversation) {
//       conversation = new Conversation({
//         userId,
//         model_id,
//         messages: [userMessage],
//       });
//     } else {
//       conversation.messages.push(userMessage);
//     }

//     await conversation.save();

//     const form = new FormData();
//     form.append("image", req.file.buffer, {
//       filename: req.file.originalname || "upload.png",
//       contentType: req.file.mimetype,
//       knownLength: req.file.size,
//     });

//     const flaskURL = "http://127.0.0.1:5000/predict-lungs";

//     const response = await axios.post(flaskURL, form, {
//       headers: form.getHeaders(),
//       maxContentLength: Infinity,
//       maxBodyLength: Infinity,
//     });

//     const { report, gradcam_images, labels } = response.data;

//     let formattedReport = `# 🫁 Lung X-ray Analysis Report\n`;

//     if (labels && labels.length > 0) {
//       labels.forEach((label) => {
//         const sectionRegex = new RegExp(`=== ${label} ===([\\s\\S]*?)(?===|$)`, "g");
//         const match = sectionRegex.exec(report);

//         if (match) {
//           let clean = match[1]
//             .replace(/ - /g, "\n- ")
//             .replace(/\n/g, "\n")
//             .trim();

//           formattedReport += `
// ---

// ## **${label}**

// ${clean}

// `;
//         }
//       });
//     } else {
//       formattedReport += "\n### ✅ No disease detected. Lungs appear healthy.";
//     }


//     const botMessage = {
//       type: "analysis",
//       content: formattedReport,
//       images: gradcam_images || null,
//       labels: labels || [],
//       timestamp: new Date(),
//     };

//     conversation.messages.push(botMessage);
//     await conversation.save();

//     res.status(200).json({
//       report: formattedReport,
//       gradcam_images: gradcam_images || null,
//       labels: labels || [],
//     });
//   } catch (err) {
//     console.error("Error in predictLungsImage controller:", err.message);
//     res.status(500).json({ error: "Error processing the Lung X-ray image" });
//   }
// };


const axios = require("axios");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");

exports.predictLungsImage = async (req, res) => {
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

    const model_id = req.body.model_id || req.query.model || "lungs";

    const userMessage = {
      type: "user",
      content: "Uploaded Lung X-ray",
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
      filename: req.file.originalname || "upload.png",
      contentType: req.file.mimetype,
      knownLength: req.file.size,
    });

    const flaskURL = "http://127.0.0.1:5000/predict-lungs";

    const response = await axios.post(flaskURL, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const apiData = response.data;
    const gradcam_images = apiData.gradcam_images || null;
    const labels = apiData.labels || [];

    let formattedReport = `# 🫁 Lung X-ray Analysis Report\n`;

    if (labels.length > 0 && apiData.report) {
      labels.forEach((label) => {
        const sectionRegex = new RegExp(`=== ${label} ===([\\s\\S]*?)(?===|$)`, "g");
        const match = sectionRegex.exec(apiData.report);

        if (match) {
          let clean = match[1].replace(/ - /g, "\n- ").trim();
          formattedReport += `\n---\n\n## **${label}**\n\n${clean}\n`;
        }
      });
    } else {
      formattedReport += "\n### ✅ No disease detected. Lungs appear healthy.";
    }

    const imagesArray = gradcam_images
      ? Object.entries(gradcam_images).map(([label, b64]) => ({
          label,
          src: `data:image/png;base64,${b64}`,
        }))
      : [];

    const botMessage = {
      type: "analysis",
      content: formattedReport,
      images: imagesArray,            
      gradcam_images: gradcam_images,  
      labels: labels,            
      timestamp: new Date(),
    };

    conversation.messages.push(botMessage);
    await conversation.save();

    res.status(200).json({
      report: formattedReport,
      gradcam_images: gradcam_images,
      labels: labels,
    });
  } catch (err) {
    console.error("Error in predictLungsImage controller:", err.message);
    res.status(500).json({ error: "Error processing the Lung X-ray image" });
  }
};
