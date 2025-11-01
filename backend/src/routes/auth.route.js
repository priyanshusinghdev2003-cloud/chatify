import express from "express"
import { Signup } from "../controller/auth.controller.js"

const router = express.Router()

router.route("/signup").post(Signup)

export default router