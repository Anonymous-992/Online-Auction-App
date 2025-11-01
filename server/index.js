import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./connection.js";

import auctionRouter from "./routes/auction.js";
import { secureRoute } from "./middleware/auth.js";
import userAuthRouter from "./routes/userAuth.js";
import userRouter from "./routes/user.js";
import contactRouter from "./routes/contact.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Log allowed origins for debugging
console.log("Allowed Origin (from .env):", process.env.ORIGIN);

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware setup
app.use(cookieParser());
app.use(express.json());

// ✅ Define allowed origins for both local and production
const allowedOrigins = [
  "https://online-auction-app-uajk.onrender.com"
];

// ✅ Configure CORS safely
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// ✅ Default route
app.get("/", async (req, res) => {
  res.json({ msg: "Welcome to Online Auction System API" });
});

// ✅ Routes
app.use("/auth", userAuthRouter);
app.use("/user", secureRoute, userRouter);
app.use("/auction", secureRoute, auctionRouter);
app.use("/contact", contactRouter);
app.use("/admin", secureRoute, adminRouter);

// ✅ Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
