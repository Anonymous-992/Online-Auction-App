import { connectDB } from "../connection.js";
import User from "../models/user.js";
import Login from "../models/Login.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateToken } from "../utils/jwt.js";
import { getClientIp, getLocationFromIp } from "../utils/geoDetails.js";

dotenv.config();

/* ---------------------------- LOGIN HANDLER ---------------------------- */
export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user._id, user.role);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];

    // Safe geo lookup for Render
    let location = {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      isp: "Unknown",
    };

    try {
      const geo = await getLocationFromIp(ip);
      if (geo) location = geo;
    } catch (err) {
      console.warn("Geo lookup failed (login):", err.message);
    }

    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      location,
      ipAddress: ip,
      userAgent,
    });

    const login = new Login({
      userId: user._id,
      ipAddress: ip,
      userAgent,
      location,
      loginAt: new Date(),
    });
    await login.save();

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

/* ---------------------------- SIGNUP HANDLER ---------------------------- */
export const handleUserSignup = async (req, res) => {
  await connectDB();
  const { name, email, password } = req.body;
  console.log("Signup received:", { name, email, password });

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const ip = getClientIp(req);
    const userAgent = req.headers["user-agent"];

    // Safe geo lookup with fallback
    let location = {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      isp: "Unknown",
    };

    try {
      const geo = await getLocationFromIp(ip);
      if (geo) location = geo;
    } catch (err) {
      console.warn("Geo lookup failed (signup):", err.message);
    }

    console.log("Resolved IP:", ip);
    console.log("Location details:", location);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      avatar: "https://avatar.iran.liara.run/public/7",
      ipAddress: ip,
      userAgent,
      location,
      signupAt: new Date(),
      lastLogin: new Date(),
    });

    await newUser.save();

    const login = new Login({
      userId: newUser._id,
      ipAddress: ip,
      userAgent,
      location,
      loginAt: new Date(),
    });
    await login.save();

    const token = generateToken(newUser._id, newUser.role);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
};

/* ---------------------------- LOGOUT HANDLER ---------------------------- */
export const handleUserLogout = async (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
