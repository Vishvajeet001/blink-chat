import router from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = router.Router();

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateSignupPayload = (body) => {
  if (
    !body.firstname?.trim() ||
    !body.lastname?.trim() ||
    !body.email?.trim() ||
    !body.password?.trim()
  ) {
    return "All fields are required.";
  }

  if (body.firstname.trim().length < 2 || body.lastname.trim().length < 2) {
    return "First name and last name must be at least 2 characters.";
  }

  if (!validateEmail(body.email)) {
    return "Please provide a valid email address.";
  }

  if (body.password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
};

const validateLoginPayload = (body) => {
  if (!body.email?.trim() || !body.password?.trim()) {
    return "Email and password are required.";
  }

  if (!validateEmail(body.email)) {
    return "Please provide a valid email address.";
  }

  return null;
};

// Register a new user
authRouter.post("/signup", async (req, res) => {
  try {
    const validationError = validateSignupPayload(req.body);
    if (validationError) {
      return res.send({
        message: validationError,
        success: false,
      });
    }

    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).send({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const validationError = validateLoginPayload(req.body);
    if (validationError) {
      return res.status(400).send({
        message: validationError,
        success: false,
      });
    }

    const user = await User.findOne({ email: req.body.email }).select(
      "+password",
    );
    if (!user) {
      return res.send({
        message: "User not found",
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!isPasswordValid) {
      return res.send({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({
      message: "Login successful",
      success: true,
      token: token,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

export default authRouter;
