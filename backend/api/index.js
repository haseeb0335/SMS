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

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Correct route imports
const Routes = require("../routes/route.js");
const biometricRoutes = require("../routes/biometricRoutes.js");

// ✅ Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express.json());

// ✅ Debug route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅" });
});

// ✅ Vercel SAFE MongoDB connection (CACHED)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URL, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("MongoDB Connected ✅");
      return mongoose;
    }).catch((err) => {
      console.error("MongoDB ERROR ❌", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ DB middleware (IMPORTANT)
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("DB CONNECTION FAILED ❌", error);
    return res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Routes
app.use("/uploads", express.static("uploads"));
app.use("/api", biometricRoutes);
app.use("/", Routes);

// ✅ Error logging
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

module.exports = app;