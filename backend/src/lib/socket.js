import {Server} from "socket.io"
import http from "http"
import express from "express"
import "dotenv/config"
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware.js"

const app = express()
const server = http.createServer(app)

const io = new Server(server,{
    cors: {
       origin: [process.env.CLIENT_URL,"http://localhost:5173", "*"],
       credentials: true
    }
})

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware)



const userSocketMap ={};

export function getReceiversocketId(userId){
    return userSocketMap[userId]
}

io.on("connection", (socket)=>{
    console.log("a user connected ", socket.user.fullName)

    const userId = socket.userId
    userSocketMap[userId]=socket.id

    io.emit("getOnlineUser", Object.keys(userSocketMap))

    socket.on("typing", ({ senderId, receiverId }) => {

    io.to(userSocketMap[receiverId]).emit("userTyping", { senderId });
  });

  // When user stops typing
  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(userSocketMap[receiverId]).emit("userStopTyping", { senderId });
  });



    socket.on("disconnect",()=>{
        console.log("a user disconnected ", socket.user.fullName)
        delete userSocketMap[userId]
        io.emit("getOnlineUser", Object.keys(userSocketMap))
    })
})

export {io, app,server}