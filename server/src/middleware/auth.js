import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import env from "../config/env.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    res.status(401);
    throw new Error("Session expired or invalid token. Please log in again.");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user not found");
  }

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error("Admin access only");
  }
  next();
};
