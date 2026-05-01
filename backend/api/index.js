import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { router as Routes } from "../routes/route.js";
import { router as biometricRoutes } from "../routes/biometricRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// ✅ CORS: Modified to allow Electron's file:// protocol
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:5001",
    "http://192.168.0.107:3000",
    "https://sms-tinj.vercel.app",
    "https://sms-xi-rose.vercel.app",
    "capacitor://sms-xi-rose.vercel.app",
    "capacitor://sms-tinj.vercel.app",
    "capacitor://localhost"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ✅ OFFLINE LOGIC: Priority to Cloud, but fallback to Local for Offline use
const MONGO_URI = process.env.MONGODB_LOCAL || "mongodb://127.0.0.1:27017/sms"; 
// Note: If you have a cloud URI, you can check internet status or just try cloud first.

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    // Try Cloud if available, else local
    const targetURI = process.env.MONGODB_CLOUD || MONGO_URI;
    await mongoose.connect(targetURI);
    console.log("✅ MongoDB Connected"); 
  } catch (err) {
    console.error("❌ MongoDB Connection Error. Ensure local MongoDB is running for offline mode.");
  }
};

connectToDatabase();

// ✅ Static Files: Ensure path is relative to where the app is installed
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", biometricRoutes);
app.use("/", Routes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Offline Server running on port ${PORT}`);
});

export default app;