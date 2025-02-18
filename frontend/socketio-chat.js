const selectReceiverForm = document.getElementById("select-receiver");
const chatForm = document.getElementById("chat");
const msgs = document.querySelector(".msgs");
const presence = document.getElementById("presence-indicator");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const errorMessage = document.querySelector(".error-message");
// const messageContainer = document.getElementById("message-container");

const handleShow = function () {
  modal.classList.remove("hidden"); // don't put dot
  overlay.classList.remove("hidden");
};

const handleClose = function () {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

const displayError = function (message) {
  handleShow();
  errorMessage.textContent = message;
};

// event listeners for the modal
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden"))
    handleClose();
});

document
  .querySelector(".close-modal")
  .addEventListener("click", () => handleClose());
overlay.addEventListener("click", () => handleClose());

// Ensure the user is authenticated, else redirect to login
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  window.location.href = "index.html"; // Redirect to login if not authenticated
}

// ✅ Connect to WebSocket with authentication
const socket = io("http://localhost:3000", {
  auth: {
    token: `Bearer ${token}`,
    user, // ✅ Send user object
  },
});

socket.on("connect", () => {
  // presence.innerText = "Online 🟢";
  console.log("✅ Connected as", user.username);
});

socket.on("disconnect", () => {
  // presence.innerText = "Offline 🔴";
  console.warn("⚠️ Disconnected from server");
});

function isTokenExpired() {
  const token = localStorage.getItem("token");
  if (!token) return true; // No token = expired

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    return Date.now() >= payload.exp * 1000; // Compare current time with expiry
  } catch (error) {
    console.error("Error decoding token:", error);
    displayError("Error decoding token");
    return true; // Assume expired on error
  }
}

setInterval(() => {
  if (isTokenExpired()) {
    console.warn("❌ Token expired! Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Token expired! Logging out...");
    if (socket) socket.disconnect();
    window.location.href = "index.html"; // Redirect to login
  }
}, 60000); // Check every 1 minute

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
  alert("Authentication failed! Please log in.");
  window.location.href = "index.html";
});

socket.on("token:expired", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Your session has expired. Please log in again.");
  if (socket) socket.disconnect();
  window.location.href = "index.html"; // Redirect to login
});

document.querySelector(".back-to-login").addEventListener("click", () => {
  // ✅ Remove token & user data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // ✅ Disconnect WebSocket before redirecting
  if (socket) {
    socket.disconnect();
    console.log("✅ WebSocket disconnected.");
  }

  // ✅ Redirect to login page
  window.location.href = "index.html";
});

socket.on("msg:get", (data) => {
  // Listen for messages
  const message = data.message[0];
  renderMessage(
    message.sender_id === user.id ? true : false,
    message.text,
    message.created_at
  );
});

// **✅** Handle Receiver Selection
selectReceiverForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const receiverUsername = document.getElementById("receiver").value.trim();

  if (!receiverUsername) {
    console.warn("⚠️ Please enter a receiver username.");
    displayError("Please enter a receiver username.");
    return;
  }

  loadMessages(receiverUsername);

  // Show the message input form
  // messageContainer.style.display = "block";
});

// **✅** Fetch and display messages when a user selects a conversation
function loadMessages(receiver) {
  socket.emit("msg:load", receiver); // Request messages for the selected receiver

  socket.on("msg:load", ({ messages }) => {
    // Listen for messages
    msgs.innerHTML = ""; // Clear previous messages
    messages.forEach(({ sender_id, text, created_at }) => {
      renderMessage(sender_id === user.id ? true : false, text, created_at);
    });

    document.getElementById("text").disabled = false; // Enable input
    document.getElementById("text").focus(); // Auto-focus when enabled
  });

  socket.on("error", (message) => {
    console.error("❌ Error:", message);
    displayError(message);
  });
}

// **✅** Send a new message
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();
  const receiverUsername = document.getElementById("receiver").value.trim();
  if (!receiverUsername || !text) {
    console.warn("⚠️ Message not sent: Missing receiver or text");
    return;
  }

  socket.emit("msg:post", { receiverUsername, text }); // ** **Send message to the server

  document.getElementById("text").value = ""; // Clear input
});

// ✅ Render a single message in the chat UI
function renderMessage(sender, text, created_at) {
  const chatBox = document.querySelector("#chat-box");

  if (text !== "") {
    const newMessage = document.createElement("div");
    if (sender) newMessage.classList.add("message", "sender");
    else newMessage.classList.add("message", "receiver");

    const messageText = document.createElement("p");
    messageText.textContent = text;

    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    timestamp.textContent = new Date(created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // Display AM/PM format
    });

    newMessage.appendChild(messageText);
    newMessage.appendChild(timestamp);
    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
