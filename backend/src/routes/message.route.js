import express from "express"
import { authMiddlware } from "../middleware/auth.middleware.js"
import { getMessagesByUserId, getUserByUsername, sendMessage,getChatPartners } from "../controller/message.controller.js"
import { arcjetProtection } from "../middleware/arcjet.middleware.js"

const router = express.Router()
router.use(arcjetProtection,authMiddlware)

router.route("/contacts").post( getUserByUsername)
router.route("/chats").get( getChatPartners)
router.route("/:id").get( getMessagesByUserId)
router.route("/send/:id").post( sendMessage)

export default router
