import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import {
  globalMiddleware,
  errorHandler,
} from "./middleware/globalMiddleware.js";
import { createUser, loginUser } from "./auth/user.js";
import { handleInputErrors } from "./middleware/validation.js";
import { sendMessage, getMessages } from "./chat/chat.js";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

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
    socket.user = decoded;

    if (!socket.user) {
      return next(new Error("Authentication required"));
    }

    if (Date.now() >= decoded.exp * 1000) {
      console.warn(`❌ Token expired for user ${decoded.username}`);
      return next(new Error("Token expired. Please log in again."));
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.warn("⚠️ Token expired, disconnecting user.");
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  if (!socket.user) {
    console.log("❌ Unauthorized connection attempt, disconnecting.");
    socket.disconnect(true);
    return;
  }

  console.log(`✅ User connected: ${socket.user.username}`);

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });

  console.log(`✅ User connected: ${socket.user.username}`);

  // ✅ Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.user.username}`);
  });

  // **✅** Handle Sending Messages
  socket.on("msg:post", async (data) => {
    // receiverUsername is the person receiving the posted message

    const messageSent = await sendMessage(
      socket,
      data.receiverUsername,
      data.text
    );

    const receiverSocket = [...io.sockets.sockets.values()].find(
      (s) => s.user?.username === data.receiverUsername
    );

    if (receiverSocket) {
      // send the message to the receiver in real-time if the receiver is online
      receiverSocket.emit("msg:get", {
        message: [messageSent],
      });

      // TODO: make online status green in the UI
    }

    // send the message to the sender in real-time to update the UI
    socket.emit("msg:get", {
      message: [messageSent],
    });
  });

  socket.on("msg:load", async (receiverUsername) => {
    // receiverUsername is the person we type his/her username in the text field and load the chats between him and the logged in user
    // in msg:get event handler for receiverUsername
    socket.emit("msg:load", await getMessages(socket, receiverUsername)); // emit msg:get event sending messages to socketio-chat.js after waiting for getMessages to resolve
  });
});

// ✅ Global Error Handling Middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
