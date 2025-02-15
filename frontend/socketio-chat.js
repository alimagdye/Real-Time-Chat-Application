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

let receiverUsername = null; // Store selected receiver

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

// ✅ Handle Receiver Selection
selectReceiverForm.addEventListener("submit", function (e) {
  e.preventDefault();
  receiverUsername = document.getElementById("receiver").value.trim();

  if (!receiverUsername) {
    console.warn("⚠️ Please enter a receiver username.");
    return;
  }

  console.log("📡 Loading messages for", receiverUsername);
  loadMessages(receiverUsername);

  // Show the message input form
  messageContainer.style.display = "block";
});

// ✅ Fetch and display messages when a user selects a conversation
function loadMessages(receiver) {
  socket.emit("msg:get", receiver);

  socket.off("msg:get"); // Remove previous listeners to prevent duplication
  socket.on("msg:get", ({ messages }) => {
    console.log("📩 Messages received:", messages);
    msgs.innerHTML = ""; // Clear previous messages
    messages.forEach(({ sender_id, text }) => {
      renderMessage(sender_id === user.id ? user.username : receiver, text);
    });
  });

  socket.on("error", (message) => {
    console.error("❌ Error:", message);
  });
}

// ✅ Send a new message
chatForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const text = document.getElementById("text").value.trim();

  if (!receiverUsername || !text) {
    console.warn("⚠️ Message not sent: Missing receiver or text");
    return;
  }

  console.log("📨 Sending message:", { receiverUsername, text });
  socket.emit("msg:post", { receiverUsername, text });

  // ✅ Optimistically render the sent message in the UI
  renderMessage(user.username, text);

  document.getElementById("text").value = ""; // Clear input
});

// ✅ Receive and display new messages in real-time
socket.on("msg:new", (newMessage) => {
  console.log("📩 New Message Received:", newMessage);

  // ✅ Call `renderMessage()` to ensure messages appear in the correct place
  renderMessage(newMessage.senderUsername, newMessage.text);
});



// ✅ Render a single message in the chat UI
function renderMessage(sender, text) {
  const msgElement = document.createElement("li");
  msgElement.classList.add("collection-item");
  msgElement.innerHTML = `<span class="badge">${sender}</span>${text}`;
  msgs.appendChild(msgElement);

  // ✅ Auto-scroll to the bottom
  msgs.scrollTop = msgs.scrollHeight;
}
