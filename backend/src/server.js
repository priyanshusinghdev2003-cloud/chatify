import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";
import authRouter from "./routes/auth.route.js"

dotenv.config()

const app = express();
const port  = process.env.PORT || 8000;


app.get("/api/test", (req,res)=>{
    res.json({message: "Hello from the test route!"});
    
})

app.use("/api/auth", authRouter)

connectDB().then(()=>{
  app.listen(port, () => {
  console.log("Server running on port localhost:", port);
});

}).catch(()=>{
  console.log("Failed to connect to MongoDB");
  process.exit(1);
  
})