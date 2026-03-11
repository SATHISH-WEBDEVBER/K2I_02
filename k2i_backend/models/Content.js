const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    titleTa: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    descriptionTa: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: ["video", "tutorial", "documentation"],
    },
    category: {
      type: String,
      required: true,
      enum: ["embedded", "iot", "webDev", "ai", "other"],
    },
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    duration: {
      type: String,
      default: "",
    },
    // File uploads
    videoFile: {
      type: String, // stored path
      default: "",
    },
    documentFile: {
      type: String,
      default: "",
    },
    thumbnailFile: {
      type: String,
      default: "",
    },
    // External links
    youtubeLink: {
      type: String,
      default: "",
    },
    githubLink: {
      type: String,
      default: "",
    },
    // Metadata
    isPublished: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Content", contentSchema);
