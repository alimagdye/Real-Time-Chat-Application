import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// function that hashes a password
export const hashPassword = async function (password) {
  return await bcrypt.hash(password, 10); // hash the password with a salt of 10 rounds to make it more secure
};

// function that compares a normal password with a hashed password
export const comparePasswords = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword); // compare the normal password with the hashed password
};

export const createJWTtoken = function (user) {
  // takes a user object which is returned from the database
  // create a JWT token and return it
  return jwt.sign(
    // jwt.sign(payload, secret, options)
    { id: user.id, username: user.username }, // payload: data to be encoded in the JWT token
    process.env.JWT_SECRET || "anotherSecret", // secret: a string that is used to sign the JWT token, if .env missed
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h", // options: expiration time of the JWT token, if .env missed
    }
  );
};

// console.log(createJWTtoken({ id: 1, username: "admin" })); // returns a JWT token and test it in thunder client

// middleware function that checks if the request is authorized
export const protect = function (req, res, next) {
  const authHeader = req.headers.authorization; // get the authorization header from the request.headers object

  // if the authorization header is missing or does not start with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No authorization token provided" });
    return; // exit the function
  }

  // token e.g., Bearer dkfjd.dkfa.faff
  const token = authHeader.split(" ")[1]; // get the token from the authorization header
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return; // exit the function
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // verify the token, if it is valid, it returns the payload of the token which is the data that was encoded in the token
    req.user = payload; // add the payload to the request object
    // console.log(req.user); // test the user object in the request object
    next(); // call the next middleware or handler
  } catch (error) {
    console.error("JWT Verification Error:", error.message); // log the error message
    if (error.name === "TokenExpiredError") {
      // if the token is expired
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      // if the token is invalid
      return res.status(401).json({ message: "Invalid token" });
    } else {
      return res.status(401).json({ message: "Authorization failed" });
    }
  }
};