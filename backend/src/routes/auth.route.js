import express from "express"
import { Signup, Login, Logout,updateProfile } from "../controller/auth.controller.js"
import { authMiddlware } from "../middleware/auth.middleware.js"
import upload from "../middleware/multer.js"
const router = express.Router()

router.route("/signup").post(Signup)
router.route("/login").post(Login)
router.route("/logout").post(Logout)

router.route("/update-profile").post(authMiddlware, upload.single("image"), updateProfile)

export default router