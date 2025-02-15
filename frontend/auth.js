document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");
  const toggleButton = document.getElementById("toggle");
  const message = document.getElementById("message");
  let isSignup = false; // Track if we're in signup mode

  // Toggle between Login and Signup
  toggleButton.addEventListener("click", () => {
    isSignup = !isSignup;
    document.getElementById("email").style.display = isSignup
      ? "block"
      : "none";
    authForm.querySelector("button[type='submit']").innerText = isSignup
      ? "Signup"
      : "Login";
    toggleButton.innerText = isSignup ? "Switch to Login" : "Switch to Signup";
  });

  // Handle form submission (Login or Signup)
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password || (isSignup && !email)) {
      message.innerText = "Please fill in all required fields.";
      return;
    }

    const endpoint = isSignup ? "/signup" : "/login";
    const body = isSignup
      ? { username, email, password }
      : { username, password };

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "chat.html"; // Redirect to chat page
      } else {
        message.innerText = data.message || "Authentication failed.";
      }
    } catch (error) {
      message.innerText = "Error connecting to server.";
      console.error("Auth Error:", error);
    }
  });
});
