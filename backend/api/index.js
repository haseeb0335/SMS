const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Routes
const Routes = require("../routes/route.js");
const biometricRoutes = require("../routes/biometricRoutes.js");

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Cached Connection (Vercel SAFE)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  try {
    console.log("Connecting to MongoDB...");

    if (cached.conn) {
      console.log("Using cached DB");
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URL, {
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("MongoDB Connected ✅");
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    console.error("MongoDB ERROR ❌:", error);
    throw error;
  }
}

// ✅ DB Middleware (VERY IMPORTANT)
// app.use(async (req, res, next) => {
//   try {
//     await connectToDatabase();
//     next();
//   } catch (error) {
//     console.error("DB CONNECTION FAILED ❌", error);
//     return res.status(500).json({ error: "Database connection failed" });
//   }
// });

// ✅ DEBUG route (after DB)
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is working ✅" });
});

// ❗ Optional (may not work on Vercel)
app.use("/uploads", express.static("uploads"));

// ✅ Your Routes
app.use("/api", biometricRoutes);
app.use("/", Routes);

// ✅ Global Error Logs
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

module.exports = app;

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// const app = express();
// const Routes = require("./routes/route.js");
// const biometricRoutes = require("./routes/biometricRoutes.js");
// // const PORT = process.env.PORT || 5000;
// const parentRoutes = require("./routes/route.js");

// dotenv.config();

// let isConnected = false;
// async function connectToDatabase() {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         isConnected = true;
//         console.log("Connected to MongoDB");
//     } catch (error) {
//         console.error("NOT CONNECTED TO NETWORK", error);
//     }
// }

// // add middleware to check database connection before processing requests
// app.use((req, res, next) => {
//     if (!isConnected) {
//         connectToDatabase()
//             .then(() => {
//                 next();
//             })
//             .catch((err) => {
//                 res.status(500).json({ error: "Database connection failed" });
//             });
//     } else {
//         next();
//     }
// });


// connectToDatabase();


// app.use(express.json({ limit: "10mb" }));
// app.use(cors());
// app.use('/Parent', parentRoutes);
// app.use("/uploads", express.static("uploads"));
// app.use("/api", biometricRoutes); // Biometric routes
// // All routes
// app.use("/", Routes);

// mongoose
//   .connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

// // app.listen(PORT, () => {
  
// //   console.log(`Server started at port no. ${PORT}`);
// // });

// module.exports = app; // Export the app for testing or serverless deployment