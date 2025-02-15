const selectReceiverForm = document.getElementById("select-receiver");
const chatForm = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
const messageContainer = document.getElementById("message-container");

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
  presence.innerText = "Online 🟢";
  console.log("✅ Connected as", user.username);
});

socket.on("disconnect", () => {
  presence.innerText = "Offline 🔴";
  console.warn("⚠️ Disconnected from server");
});

socket.on("msg:get", (data) => {
  // Listen for messages
  console.log("📩 Messages received:", data);
  const message = data.message[0];
  renderMessage(message.sender_username, message.text, message.created_at);
});

// **✅** Handle Receiver Selection
selectReceiverForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const receiverUsername = document.getElementById("receiver").value.trim();

  if (!receiverUsername) {
    console.warn("⚠️ Please enter a receiver username.");
    return;
  }

  console.log("📡 Loading messages for", receiverUsername);
  loadMessages(receiverUsername);

  // Show the message input form
  messageContainer.style.display = "block";
});

// **✅** Fetch and display messages when a user selects a conversation
function loadMessages(receiver) {
  socket.emit("msg:load", receiver); // Request messages for the selected receiver

  socket.on("msg:load", ({ messages }) => {
    // Listen for messages
    console.log("📩 Messages received:", messages);
    msgs.innerHTML = ""; // Clear previous messages
    messages.forEach(({ sender_id, text, created_at }) => {
      renderMessage(
        sender_id === user.id ? user.username : receiver,
        text,
        created_at
      );
    });
  });

  socket.on("error", (message) => {
    console.error("❌ Error:", message);
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

  console.log("📨 Sending message:", { receiverUsername, text });
  socket.emit("msg:post", { receiverUsername, text }); // ** **Send message to the server

  document.getElementById("text").value = ""; // Clear input
});

// ✅ Render a single message in the chat UI
function renderMessage(sender, text, created_at) {
  const msgElement = document.createElement("li");
  msgElement.classList.add("collection-item");

  // ✅ Format the timestamp (HH:MM AM/PM)
  const time = new Date(created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Display AM/PM format
  });

  // ✅ Display sender, message text, and time
  msgElement.innerHTML = `<span class="badge">${sender} | ${time}</span> ${text}`;

  // ✅ Add new message at the top instead of the bottom
  msgs.prepend(msgElement);
}
