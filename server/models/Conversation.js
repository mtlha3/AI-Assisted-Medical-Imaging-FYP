const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["user", "analysis"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: { 
    type: String,
  },
  images: [ 
    {
      label: String,
      src: String,
    }
  ],
  gradcam_images: { 
    type: mongoose.Schema.Types.Mixed,
  },
  labels: [String], 
  timestamp: {
    type: Date,
    default: Date.now,
  },
  confidence: {
    type: Number,
  },
});

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true },
  model_id: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
