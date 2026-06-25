import express from "express"
import { staffLogin } from "../controllers/authController.js"

const router = express.Router()

// POST /api/auth/login
router.post("/login", staffLogin)

export default router