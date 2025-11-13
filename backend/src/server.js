import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";
import authRouter from "./routes/auth.route.js"
import messageRouter from "./routes/message.route.js"
import path from "path"
import cookieParser from "cookie-parser";
import cors from "cors"
import { app, server } from "./lib/socket.js";

dotenv.config()



const port  = process.env.PORT || 8000;
const __dirname = path.resolve();


app.use(cors({
  origin: ["http://localhost:5173", "*"], 
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/auth", authRouter)
app.use("/api/message",messageRouter)

app.get("/api/test", (req,res)=>{
    res.json({message: "Hello from the test route!"});
    
})
// make ready for deployment
if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")))
  app.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "../frontend","dist","index.html"))
    
  })
}

connectDB().then(()=>{
  server.listen(port, () => {
  console.log("Server running on port localhost:", port);
});

}).catch(()=>{
  console.log("Failed to connect to MongoDB");
  process.exit(1);
  
})