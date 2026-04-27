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

// ✅ Routes
const Routes = require("../routes/route.js");
const biometricRoutes = require("../routes/biometricRoutes.js");

// ✅ Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://sms-xi-rose.vercel.app", "https://sms-tinj.vercel.app" ,"http://192.168.0.107:3000" ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json());

// ✅ Debug route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅" });
});

// ✅ Smart DB Selection (ONLINE vs OFFLINE)
const MONGO_URI = (process.env.NODE_ENV === "production") 
    ? process.env.MONGODB_CLOUD 
    : (process.env.MONGODB_LOCAL || process.env.MONGODB_CLOUD);

// ✅ Cached DB connection (Vercel safe)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    })
    .then((mongoose) => {
      console.log("MongoDB Connected ✅");
      return mongoose;
    })
    .catch((err) => {
      console.error("MongoDB ERROR ❌", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ DB Middleware
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

// ✅ Local server (ONLY for offline)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running!`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.0.107:${PORT}`);
});

// ✅ Error logging
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

module.exports = app;