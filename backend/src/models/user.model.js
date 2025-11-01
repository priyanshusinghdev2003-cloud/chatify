import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,        
    },
    fullName: {
        type: String,
        required: true
        
    },
    password: {
        type: String,
        required: true
    },
    profilePic :{
        type: String,
        default: ""
    },
     resetCode: String,
    resetCodeExpire: Date,
    
},{
    timestamps: true
    
})

const User = mongoose.model('User', UserSchema)

export default User;