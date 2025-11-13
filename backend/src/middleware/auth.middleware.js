import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import "dotenv/config"

export const authMiddlware = async (req,res,next)=>{
    const token = req.cookies?.jwt
    try {
        if(!token) return res.status(404).json({
            message: "Unauthorized: Token is not Provided",
            success: false
        })
        const decodedToken = jwt.verify(token, process.env.JWT_SECCRET)
        if(!decodedToken) return res.status(404).json({
            message: "Unauthorized: Token is not Provided",
            success: false
        })
        const user = await User.findById({_id: decodedToken.userId}).select("-password")
        if(!user) return res.status(404).json({
            message: "User Not Found",
            success: false
        })
        req.user = user
        next()
    } catch (error) {
        return res.status(500).json({
            message: error,
            success: false
        })
    }
}