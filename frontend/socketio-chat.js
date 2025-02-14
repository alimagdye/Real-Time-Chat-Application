// a global called "io" is being loaded separately

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

// Connect to the server
const socket = io("http://localhost:3000");

socket.on("connect", () => {
  presence.innerText = "Online 🟢";
});

socket.on("disconnect", () => {
  presence.innerText = "Offline 🔴";
});

socket.on("msgs:get", (data) => {
  // this is the event the client uses to get the messages
  allChat = data.message; // get the messages from the server
  render(); // call the render function to display the messages
});

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  // create the data object to send to the server
  const data = {
    user,
    text,
    time: Date.now(),
  };

  socket.emit("msgs:post", data); // this is the event the client uses to post a new message
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
