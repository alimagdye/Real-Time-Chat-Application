import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { globalMiddleware, errorHandler } from "./middleware/globalMiddleware";
import { createUser, loginUser } from "./auth/user";
import { handleInputErrors } from "./middleware/validation";
import { protect } from "./auth/auth";
import { sendMessage, getMessages } from "./chat/chat";
import { body } from "express-validator";

const app = express(); // create Express app

app.use(globalMiddleware); // apply global middleware

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
); // create a user and save it to the database and return a JWT token

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
); // login a user and return a JWT token

// Protect messaging routes with authentication
app.use("/chat", protect, express.static("./frontend"));

// API Endpoints for Messages (Protected)
app.post("/messages", protect, sendMessage);
app.get("/messages/:username", protect, getMessages);

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", async (socket) => {
  console.log(`New user connected: ${socket.id}`);

  // Fetch previous messages when requested
  socket.on("msgs:get", async ({ receiverUsername, token }) => {
    const req = {
      user: protect(token),
      params: { username: receiverUsername },
    };
    const res = {
      status: (code) => ({
        json: (data) => socket.emit("msgs:get", data),
      }),
    };

    await getMessages(req, res);
  });

  // Handle sending messages
  socket.on("msgs:post", async ({ receiverUsername, text, token }) => {
    const req = { user: protect(token), body: { receiverUsername, text } };
    const res = {
      status: (code) => ({
        json: (data) => {
          if (code === 201) io.emit("msgs:get", data);
          else socket.emit("error", data);
        },
      }),
    };

    await sendMessage(req, res);
  });
});

app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
