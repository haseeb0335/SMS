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
import Routes from "../routes/route.js";
import biometricRoutes from "../routes/biometricRoutes.js";

dotenv.config();
const app = express();

// ✅ CORS: Added your local IP so your phone is allowed to connect
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://192.168.0.107:3000",
     "https://sms-tinj.vercel.app",
    "https://sms-xi-rose.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// ✅ DB Selection Logic
const MONGO_URI = process.env.MONGODB_CLOUD || process.env.MONGODB_LOCAL;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected to:", mongoose.connection.name); 
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

// ✅ Middleware to ensure DB is connected before any request
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅", db: mongoose.connection.name });
});

app.use("/uploads", express.static("uploads"));
app.use("/api", biometricRoutes);
app.use("/", Routes);

// ✅ Start Server on 0.0.0.0 to allow network access
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://192.168.0.107:${PORT}`);
});

export default app;