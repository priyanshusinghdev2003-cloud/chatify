import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
//get user by username
export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (userId == user._id) {
      return res.json({
        success: false,
        message: "TypeDifferent USername",
      });
    }

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json({
      message: "chat fetched successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load chat",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    res.status(201).json({
      message: "message sent successfuly",
      newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load chat",
      error: error.message,
    });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    //find all the message wherre a logged In user either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUser }, { receiverId: loggedInUser }],
    });
    const chatParnerId = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUser.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];
    const chatPartners = await User.find({ _id: { $in: chatParnerId } }).select(
      "-password -email -createdAt -updatedAt"
    );
    res.status(200).json({
      message: "Partners Fetched Succefully",
      chatPartners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load partner",
      error: error.message,
    });
  }
};
