import { validationResult } from "express-validator";

// middleware function that handles all input errors (validator)
export const handleInputErrors = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array() });
    return;
  }

  next();
};
