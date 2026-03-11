require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const app = express();

// ─── Create upload directories ────────────────────────────────────────────────
["uploads", "uploads/profiles", "uploads/videos", "uploads/docs"].forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    message: { success: false, message: "Too many requests. Please slow down." },
  })
);

// ─── Static file serving for uploads ─────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/admin", require("./routes/admin"));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "K2I API is running",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS error: origin not allowed." });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ─── Connect to MongoDB & Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // Seed default admin on first run
    await seedDefaultAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 K2I Server running on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ─── Seed default admin account ───────────────────────────────────────────────
async function seedDefaultAdmin() {
  try {
    const User = require("./models/User");
    const adminEmail = process.env.ADMIN_EMAIL || "admin@k2i.com";
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      await User.create({
        name: "K2I Admin",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || "Admin@123456",
        role: "admin",
        isActive: true,
      });
      console.log(`👤 Default admin created: ${adminEmail}`);
    } else {
      console.log(`👤 Admin already exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error("Admin seed error:", err.message);
  }
}

module.exports = app;
