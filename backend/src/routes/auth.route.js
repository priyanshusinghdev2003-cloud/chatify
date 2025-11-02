import express from "express"
import { Signup, Login, Logout } from "../controller/auth.controller.js"

const router = express.Router()

router.route("/signup").post(Signup)
router.route("/login").post(Login)
router.route("/logout").post(Logout)

export default router