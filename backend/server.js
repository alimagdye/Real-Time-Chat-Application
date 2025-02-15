import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import {
  globalMiddleware,
  errorHandler,
} from "./middleware/globalMiddleware.js";
import { createUser, loginUser } from "./auth/user.js";
import { handleInputErrors } from "./middleware/validation.js";
import { protect } from "./auth/auth.js";
import { sendMessage, getMessages } from "./chat/chat.js";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { supabase } from "./config/db.js";

const app = express(); // Create Express app

app.use(globalMiddleware); // Apply global middleware

// ✅ Serve Static Files (index.html for login & chat.html for chat)
app.use(express.static("./frontend"));

app.post(
  "/signup",
  [
    body("username").isString().withMessage("name must be a string"),
    body("email").isEmail().withMessage("email must be a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters long"),
  ],
  handleInputErrors,
  createUser
); // Register a user

app.post(
  "/login",
  [
    body("username").isString().withMessage("name must be a string"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters long"),
  ],
  handleInputErrors,
  loginUser
); // Login user

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ Authenticate WebSocket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token || !token.startsWith("Bearer ")) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    socket.user = decoded; // Attach user to socket
    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// ✅ WebSocket Event Handlers
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.user.username}`);

  // ✅ Handle Sending Messages
  socket.on("msg:post", (data) => {
    console.log("📨 Server received msg:post:", data);
    sendMessage(socket, data);
  });

  // ✅ Handle Fetching Messages
  socket.on("msg:get", (receiverUsername) => {
    console.log(`📡 Server received msg:get for ${receiverUsername}`);
    getMessages(socket, receiverUsername);
  });

  // ✅ Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });
});

// ✅ Global Error Handling Middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () =>
  console.log(`🚀 Server running at http://localhost:${port}`)
);
