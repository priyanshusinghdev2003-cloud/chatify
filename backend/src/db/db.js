import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`).then(()=>{
            console.log("Connected to MongoDB", mongoose.connection.host
            );
            
        })
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
        
    }
}

export default connectDB