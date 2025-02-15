import { createJWTtoken, hashPassword, comparePasswords } from "./auth.js";
import { supabase } from "../config/db.js"; // Import the Supabase client

export const createUser = async function (req, res) {
  const { username, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into DB
    const { data: user, error } = await supabase
      .from("users")
      .insert([{ username, email, password: hashedPassword }])
      .select("id, username, email")
      .single();

    if (error) {
      console.error("Error creating user:", error.message);
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    // Generate JWT token
    const token = createJWTtoken(user);

    res.status(201).json({
      message: "Sign up successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async function (req, res) {
  const { username, password } = req.body;

  try {
    // Find user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      console.error("Invalid username or password");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Dummy hash to prevent timing attacks
    const dummyHash = "$2b$10$dummyhashdummyhashdummyhashdummyhashdummyhash";
    const isPasswordCorrect = await comparePasswords(
      password,
      user.password || dummyHash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = createJWTtoken(user);

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
      token,
    });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
