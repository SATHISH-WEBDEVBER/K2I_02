const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Content = require("../models/Content");
const { protect, adminOnly, generateToken } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

// Content file upload config
const contentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.startsWith("video/") ? "uploads/videos/" : "uploads/docs/";
    fs.mkdirSync(type, { recursive: true });
    cb(null, type);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.mimetype.startsWith("video/") ? "video" : "doc";
    cb(null, `${prefix}_${Date.now()}${ext}`);
  },
});
const contentUpload = multer({
  storage: contentStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB for videos
  fileFilter: (req, file, cb) => {
    const allowed = [
      "video/mp4", "video/webm", "video/ogg",
      "application/pdf",
      "image/jpeg", "image/png", "image/gif", "image/webp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed"), false);
  },
});

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── CREATE ADMIN ACCOUNT ─────────────────────────────────────────────────────
router.post(
  "/create-admin",
  [
    body("name").trim().isLength({ min: 2, max: 50 }),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body("adminSecretKey").notEmpty().withMessage("Admin secret key required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, adminSecretKey } = req.body;

    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: "Invalid admin secret key." });
    }

    try {
      // Enforce max 4 admins
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount >= (parseInt(process.env.MAX_ADMINS) || 4)) {
        return res.status(409).json({
          success: false,
          message: `Maximum admin limit (${process.env.MAX_ADMINS || 4}) has been reached.`,
        });
      }

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered." });
      }

      const admin = await User.create({ name, email, password, role: "admin" });

      res.status(201).json({
        success: true,
        message: "Admin account created successfully.",
        user: admin.toSafeObject(),
      });
    } catch (error) {
      console.error("Create admin error:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

// ─── GET ALL USERS ────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-password -passwordResetToken -passwordResetExpires");

    const adminCount = await User.countDocuments({ role: "admin" });
    const activeCount = await User.countDocuments({ isActive: true });
    const inactiveCount = await User.countDocuments({ isActive: false });

    res.status(200).json({
      success: true,
      users,
      stats: { total, adminCount, activeCount, inactiveCount },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET SINGLE USER ──────────────────────────────────────────────────────────
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -passwordResetToken -passwordResetExpires"
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── TOGGLE USER ACTIVE STATUS ────────────────────────────────────────────────
router.patch("/users/:id/toggle-status", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot deactivate your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Prevent deactivating last admin
    if (user.role === "admin" && user.isActive) {
      const activeAdmins = await User.countDocuments({ role: "admin", isActive: true });
      if (activeAdmins <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the last active admin.",
        });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── DELETE USER ──────────────────────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Prevent deleting last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last admin account.",
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── UPDATE USER ROLE ─────────────────────────────────────────────────────────
router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role." });
  }

  try {
    // Enforce max admins
    if (role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount >= (parseInt(process.env.MAX_ADMINS) || 4)) {
        return res.status(409).json({
          success: false,
          message: `Maximum admin limit (${process.env.MAX_ADMINS || 4}) has been reached.`,
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      user: user.toSafeObject(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── UPLOAD CONTENT ───────────────────────────────────────────────────────────
router.post(
  "/content",
  contentUpload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "documentFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 },
  ]),
  [
    body("title").trim().isLength({ min: 3, max: 150 }).withMessage("Title is required (3-150 chars)"),
    body("description").trim().isLength({ min: 10, max: 1000 }).withMessage("Description required (10-1000 chars)"),
    body("type").isIn(["video", "tutorial", "documentation"]).withMessage("Invalid type"),
    body("category").isIn(["embedded", "iot", "webDev", "ai", "other"]).withMessage("Invalid category"),
    body("level").isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid level"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const {
        title, titleTa, description, descriptionTa,
        type, category, level, duration,
        youtubeLink, githubLink, tags,
      } = req.body;

      const contentData = {
        title, titleTa: titleTa || "",
        description, descriptionTa: descriptionTa || "",
        type, category, level, duration: duration || "",
        youtubeLink: youtubeLink || "",
        githubLink: githubLink || "",
        uploadedBy: req.user._id,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim())) : [],
      };

      if (req.files?.videoFile?.[0]) {
        contentData.videoFile = `/uploads/videos/${req.files.videoFile[0].filename}`;
      }
      if (req.files?.documentFile?.[0]) {
        contentData.documentFile = `/uploads/docs/${req.files.documentFile[0].filename}`;
      }
      if (req.files?.thumbnailFile?.[0]) {
        contentData.thumbnailFile = `/uploads/docs/${req.files.thumbnailFile[0].filename}`;
      }

      const content = await Content.create(contentData);

      res.status(201).json({
        success: true,
        message: "Content uploaded successfully.",
        content,
      });
    } catch (error) {
      console.error("Content upload error:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

// ─── GET ALL CONTENT (admin view - includes unpublished) ─────────────────────
router.get("/content", async (req, res) => {
  try {
    const { type, category, search, isPublished, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type && type !== "all") query.type = type;
    if (category && category !== "all") query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === "true";
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalContent = await Content.countDocuments({});
    const publishedCount = await Content.countDocuments({ isPublished: true });

    res.status(200).json({
      success: true,
      content,
      stats: { total: totalContent, published: publishedCount, unpublished: totalContent - publishedCount },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── UPDATE CONTENT ───────────────────────────────────────────────────────────
router.put("/content/:id", async (req, res) => {
  try {
    const {
      title, titleTa, description, descriptionTa,
      type, category, level, duration,
      youtubeLink, githubLink, isPublished, tags,
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (titleTa !== undefined) updateData.titleTa = titleTa;
    if (description) updateData.description = description;
    if (descriptionTa !== undefined) updateData.descriptionTa = descriptionTa;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (level) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (youtubeLink !== undefined) updateData.youtubeLink = youtubeLink;
    if (githubLink !== undefined) updateData.githubLink = githubLink;
    if (isPublished !== undefined) updateData.isPublished = isPublished === "true" || isPublished === true;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim());

    const content = await Content.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!content) return res.status(404).json({ success: false, message: "Content not found." });

    res.status(200).json({ success: true, message: "Content updated.", content });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── DELETE CONTENT ───────────────────────────────────────────────────────────
router.delete("/content/:id", async (req, res) => {
  try {
    const content = await Content.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Content not found." });

    // Clean up uploaded files
    const filesToDelete = [content.videoFile, content.documentFile, content.thumbnailFile]
      .filter(Boolean)
      .map((f) => path.join(__dirname, "..", f));

    filesToDelete.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) console.error("File delete error:", err.message);
        });
      }
    });

    res.status(200).json({ success: true, message: "Content deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
router.get("/dashboard-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const activeUsers = await User.countDocuments({ role: "user", isActive: true });
    const inactiveUsers = await User.countDocuments({ role: "user", isActive: false });
    const totalContent = await Content.countDocuments({});
    const publishedContent = await Content.countDocuments({ isPublished: true });
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email isActive createdAt");
    const recentContent = await Content.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type category isPublished createdAt");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        activeUsers,
        inactiveUsers,
        totalContent,
        publishedContent,
        maxAdmins: parseInt(process.env.MAX_ADMINS) || 4,
        adminSlotsLeft: Math.max(0, (parseInt(process.env.MAX_ADMINS) || 4) - totalAdmins),
      },
      recentUsers,
      recentContent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
