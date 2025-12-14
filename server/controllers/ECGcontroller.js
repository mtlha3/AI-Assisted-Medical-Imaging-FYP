const axios = require("axios");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const Conversation = require("../models/Conversation");

exports.predictECGImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No ECG image uploaded" });

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

        const model_id = req.body.model_id || req.query.model || "ecg";

        const userMessage = {
            type: "user",
            content: "Uploaded ECG image",
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
            filename: req.file.originalname || "ecg.png",
            contentType: req.file.mimetype,
            knownLength: req.file.size,
        });

        const flaskURL = "http://127.0.0.1:5000/predict-ecg";

        const response = await axios.post(flaskURL, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const apiData = response.data;
        const gradcam_image = apiData.gradcam_image || null;
        const predicted_class = apiData.predicted_class || "Unknown";
        const explanation = apiData.explanation || "No explanation provided";

        let imagesArray = [];
        if (gradcam_image) {
            imagesArray.push({
                label: predicted_class,
                src: `data:image/png;base64,${gradcam_image}`,
            });
        }

        const botMessage = {
            type: "analysis",
            content: `# ❤️ ECG Analysis Report\n\n**Predicted Class:** ${predicted_class}\n\n**Explanation:**\n${explanation}`,
            images: imagesArray,
            gradcam_image: gradcam_image,
            predicted_class: predicted_class,
            timestamp: new Date(),
        };

        conversation.messages.push(botMessage);
        await conversation.save();

        res.status(200).json({
            report: `# ❤️ ECG Analysis Report

**Predicted Class:** ${predicted_class}

**Explanation:**
${explanation}`,
            predicted_class,
            explanation,
            gradcam_image,
        });

    } catch (err) {
        console.error("Error in predictECGImage controller:", err.message);
        res.status(500).json({ error: "Error processing the ECG image" });
    }
};
