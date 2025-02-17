document.querySelector(".send-btn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keypress", function (e) {
  if (e.key === "Enter") sendMessage();
});

function renderMessage(sender, text, created_at) {
  const chatBox = document.getElementById("chat-box");

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
