import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from './connection.js';
import auctionRouter from './routes/auction.js';
import { secureRoute } from './middleware/auth.js';
import userAuthRouter from './routes/userAuth.js';
import userRouter from './routes/user.js';
import contactRouter from "./routes/contact.js";
import adminRouter from './routes/admin.js';

dotenv.config();
const port = process.env.PORT || 4000;

connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());

// ✅ Fix: precise CORS setup for production
const allowedOrigin = process.env.ORIGIN?.replace(/\/+$/, '');
console.log("Allowed Origin:", allowedOrigin);

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

// ✅ API routes
app.get('/', (req, res) => {
  res.json({ msg: 'Welcome to Online Auction System API' });
});

app.use('/auth', userAuthRouter);
app.use('/user', secureRoute, userRouter);
app.use('/auction', secureRoute, auctionRouter);
app.use('/contact', contactRouter);
app.use('/admin', secureRoute, adminRouter);

// ✅ Cookie fix: ensure proper SameSite and secure options in production
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
