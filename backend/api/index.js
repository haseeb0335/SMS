// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // ✅ Routes
// const Routes = require("../routes/route.js");
// const biometricRoutes = require("../routes/biometricRoutes.js");

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ✅ MongoDB Cached Connection (Vercel SAFE)
// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// async function connectToDatabase() {
//   try {
//     console.log("Connecting to MongoDB...");

//     if (cached.conn) {
//       console.log("Using cached DB");
//       return cached.conn;
//     }

//     if (!cached.promise) {
//       cached.promise = mongoose.connect(process.env.MONGODB_URL, {
//         bufferCommands: false,
//       })
//       .then((mongoose) => {
//         console.log("MongoDB Connected ✅");
//         return mongoose;
//       });
//     }

//     cached.conn = await cached.promise;
//     return cached.conn;

//   } catch (error) {
//     console.error("MongoDB ERROR ❌:", error);
//     throw error;
//   }
// }

// // ✅ DB Middleware (VERY IMPORTANT)
// app.use(async (req, res, next) => {
//   try {
//     await connectToDatabase();
//     next();
//   } catch (error) {
//     console.error("DB CONNECTION FAILED ❌", error);
//     return res.status(500).json({ error: "Database connection failed" });
//   }
// });

// // ✅ DEBUG route (after DB)
// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Server is working ✅" });
// });

// // ❗ Optional (may not work on Vercel)
// app.use("/uploads", express.static("uploads"));

// // ✅ Your Routes
// app.use("/api", biometricRoutes);
// app.use("/", Routes);

// // ✅ Global Error Logs
// process.on("unhandledRejection", (err) => {
//   console.error("UNHANDLED REJECTION:", err);
// });

// process.on("uncaughtException", (err) => {
//   console.error("UNCAUGHT EXCEPTION:", err);
// });

// module.exports = app;

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

// ✅ Robust CORS: Dynamic origin handling for multiple domains
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5001",
  "http://192.168.0.107:3000",
  "https://sms-tinj.vercel.app",
  "https://sms-xi-rose.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Electron local file loads)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('file://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));

// ✅ OFFLINE LOGIC: Priority to Cloud, but fallback to Local for Offline use
const MONGO_URI = process.env.MONGODB_LOCAL || "mongodb://127.0.0.1:27017/sms"; 

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    const targetURI = process.env.MONGODB_CLOUD || MONGO_URI;
    await mongoose.connect(targetURI);
    console.log("✅ MongoDB Connected"); 
  } catch (err) {
    console.error("❌ MongoDB Connection Error. Ensure local MongoDB is running for offline mode.");
  }
};

connectToDatabase();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", biometricRoutes);
app.use("/", Routes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Offline Server running on port ${PORT}`);
});

export default app;