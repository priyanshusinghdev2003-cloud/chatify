import express from "express"
import { Signup, Login, Logout,updateProfile } from "../controller/auth.controller.js"
import { authMiddlware } from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.js"
import { arcjetProtection } from "../middleware/arcjet.middleware.js"

const router = express.Router()
router.use(arcjetProtection)

router.route("/signup").post(Signup)
router.route("/login").post(Login)
router.route("/logout").post(Logout)

router.route("/update-profile").post(authMiddlware, upload.single("image"), updateProfile)
router.route("/check").get(authMiddlware,(req,res)=> res.status(200).json(req.user))

export default router