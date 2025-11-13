import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import "dotenv/config";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];
    if (!token) {
      console.log("Socket connection rejected: No Token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECCRET);
    if (!decodedToken)
      return next(new Error("Unauthorized - Token is Invalid"));
    const user = await User.findById({ _id: decodedToken.userId }).select(
      "-password"
    );
    if (!user)
      return next(new Error("User not Found"));

    socket.user = user;
    socket.userId = user._id.toString();
    console.log(
      `Socket authenticated for user: ${user.fullName} (${user._id})`
    );
    next();
  } catch (error) {
    console.log("Error in socket authentication: ", error.message);
     next(new Error("Unauthorized - Authentication Failed"));
  }
};
