import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";

//generate token
const generateToken = async (userId, res) => {
  const token = await jwt.sign({ userId }, process.env.JWT_SECCRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "development" ? false : true,
  });
};

//generate unique username
const generateUniqueUsername = async (fullName) => {
  const baseUsername = fullName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// SignUp controller
export const Signup = async (req, res) => {
  const { email, fullName, password } = req.body;
  try {
    const name = typeof fullName === "string" ? fullName.trim() : "";
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const pass = typeof password === "string" ? password : "";

    if (!normalizedEmail || !name || !pass) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }
    if (pass.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }
    //check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (user) {
      return res.status(400).json({
        message: "Email already exists with this email",
        success: false,
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(pass, salt);

    // generate unique username
    const username = await generateUniqueUsername(name);

    const newUser = new User({
      email: normalizedEmail,
      fullName: name,
      password: hashPassword,
      username: username,
    });
    if (newUser) {
      await newUser.save();
      const token = await generateToken(newUser._id, res);
      try {
        await sendWelcomeEmail(
          newUser.email,
          newUser.fullName,
          process.env.CLIENT_URL
        );
      } catch (err) {
        console.log("Failed to send welcome email: ", err);
      }
      return res.status(201).json({
        message: "User created successfully",
        success: true,
        data: {
          _id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          profilePic: newUser.profilePic,
          username: newUser.username,
        },
      });
    } else {
      return res.status(400).json({
        message: "User not created",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const pass = typeof password === "string" ? password : "";
    if (!normalizedEmail || !pass) {
      return res.status(400).json({
        message: "All Fields are required",
        success: false,
      });
    }
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });

    const isPasswordCorrect = await bcrypt.compare(pass, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({
        message: "Invalid Credentials",
        success: false,
      });

    await generateToken(user._id, res);
    return res.status(200).json({
      success: true,
      message: "Login Successfully",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        username: user.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error,
      success: false,
    });
  }
};

export const Logout = async (_, res) => {
  try {
    return res
      .cookie("jwt", "", {
        maxAge: 0,
      })
      .status(200)
      .json({
        message: "Logout Successfully",
        success: true,
      });
  } catch (error) {
    return res.status(500).json({
      message: error,
      success: false,
    });
  }
};

//profile-update
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    let imageUrl;

    // update ProfilePic
    if (req.file) {
      // 🔹 Step 1: Delete old image from Cloudinary (if exists)
      if (req.user.profilePic) {
        try {
          const segments = req.user.profilePic.split("/");
          const filename = segments.pop(); // xyz987.png
          const publicId = filename.split(".")[0]; // xyz987

          await cloudinary.uploader.destroy(`profiles/${publicId}`);
          console.log("Old profile picture deleted:", publicId);
        } catch (deleteError) {
          console.error(
            "Error deleting old image from Cloudinary:",
            deleteError
          );
        }
      }

      // 🔹 Step 2: Upload new image
      imageUrl = await uploadToCloudinary(req.file.path);
      fs.unlinkSync(req.file.path); // Remove local temp file
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: req.user.name,
        email: req.user.email,
        profilePic: imageUrl || req.user.profilePic,
      },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};
