"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");
  // const message = document.getElementById("message");

  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  let isLogin = true;

  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.classList.replace("fa-eye-slash", "fa-eye"); // Open eye
    } else {
      passwordInput.type = "password";
      togglePassword.classList.replace("fa-eye", "fa-eye-slash"); // Closed eye
    }
  });

  document
    .getElementById("signupBtn")
    .addEventListener("click", function (event) {
      event.preventDefault();

      if (isLogin) {
        isLogin = false;
        // Update text
        document.getElementById("formTitle").innerText =
          "Register for an account";
        document.getElementById("formSubtitle").innerText =
          "Sign up now to unlock a world of communication";

        document.getElementById("signupSpan").innerText =
          "Already have an account?";
        // Show username field
        document.getElementById("email").style.display = "block";

        // Change background image
        document.querySelector(".image-container").style.backgroundImage =
          "url('./signup.jpg')";
        document.querySelector(".image-container").style.backgroundColor =
          "#731ef3f9";

        document.getElementById("signupBtn").innerText = "sign in";
        document.getElementById("signinBtn").innerText = "sign up";
      } else {
        isLogin = true;
        // Update text
        document.getElementById("formTitle").innerText =
          "Please log in to your account";
        document.getElementById("formSubtitle").innerText =
          "Welcome back! Please sign in using your credentials";

        document.getElementById("signupSpan").innerText =
          "Don't have an account?";
        // Show username field
        document.getElementById("email").style.display = "none";

        // Change background image
        document.querySelector(".image-container").style.backgroundImage =
          "url('./login.jpg')";
        document.querySelector(".image-container").style.backgroundColor =
          "#3d088dec";

        document.getElementById("signupBtn").innerText = "sign up";
        document.getElementById("signinBtn").innerText = "sign in";
      }
    });

  // ✅ Handle form submission
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // message.innerText = ""; // Clear previous messages

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email-field").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password || (!isLogin && !email)) {
      return;
    }

    const endpoint = isLogin ? "/login" : "/signup";
    const body = isLogin
      ? { username, password }
      : { username, email, password };

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
        window.location.href = "chat.html"; // ✅ Redirect on success
      } else {
        // message.innerText = data.message || "Authentication failed.";
        console.error("Server Response:", data);
      }
    } catch (error) {
      // message.innerText = "Error connecting to server.";
      console.error("Auth Error:", error);
    }
  });
});
