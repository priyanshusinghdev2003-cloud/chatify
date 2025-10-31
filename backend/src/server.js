import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/db.js";
import authRouter from "./routes/auth.route.js"
import path from "path"

dotenv.config()

const app = express();
const port  = process.env.PORT || 8000;
const __dirname = path.resolve();


app.get("/api/test", (req,res)=>{
    res.json({message: "Hello from the test route!"});
    
})

app.use("/api/auth", authRouter)

// make ready for deployment
if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "../frontend/dist")))
  app.get("*", (req,res)=>{
    res.sendFile(path.join(__dirname, "../frontend","dist","index.html"))
  })
}

connectDB().then(()=>{
  app.listen(port, () => {
  console.log("Server running on port localhost:", port);
});

}).catch(()=>{
  console.log("Failed to connect to MongoDB");
  process.exit(1);
  
})