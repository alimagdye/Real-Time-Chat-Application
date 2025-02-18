"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const authForm = document.getElementById("authForm");

  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const errorMessage = document.querySelector(".error-message");
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

    // Regular Expressions for Validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/; // 3-15 chars, letters, numbers, underscores only
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Standard email format
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // At least 8 characters, one uppercase, one lowercase, one number, one special character

    // ✅ Username Validation
    if (!username) {
      displayError("Username is required");
      return;
    } else if (!usernameRegex.test(username)) {
      displayError(
        "Username must be 3-15 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    // ✅ Email Validation (Only when signing up)
    if (!isLogin) {
      if (!email) {
        displayError("Email is required");
        return;
      } else if (!emailRegex.test(email)) {
        displayError("Invalid email format");
        return;
      }
    }

    // ✅ Password Validation
    if (!password) {
      displayError("Password is required");
      return;
    } else if (!passwordRegex.test(password)) {
      displayError(
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
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
        displayError(data.message || "Authentication failed.");
        console.error("Server Response:", data);
      }
    } catch (error) {
      // message.innerText = "Error connecting to server.";
      displayError("Error connecting to server.");
      console.error("Auth Error:", error);
    }
  });
});
