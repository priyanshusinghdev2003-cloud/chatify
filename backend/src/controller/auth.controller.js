import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

//generate token
const generateToken = async (userId, res) => {
  const token = await jwt.sign(
    {userId},
    process.env.JWT_SECCRET,
    { expiresIn: "7d" }
  );
  res.cookie("jwt", token , {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "development" ? false : true,
  })
};

// SignUp controller
export const Signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    if (!email || !fullName || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }
    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email,
      fullName,
      password: hashPassword,
    });
    if (newUser) {
      const token = await generateToken(newUser._id, res);

      await newUser.save();
      return res.status(201).json({
        message: "User created successfully",
        success: true,
        user: {
          email: newUser.email,
          fullName: newUser.fullName,
          profilePic: newUser.profilePic,
        },
      });
    } else {
      return res.status(400).json({
        message: "User not created",
        success: false,
      });
    }
  } catch (error) {
    
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};
