import express from "express"
import staffAuth from "../middleware/auth.js"
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  seedMenuItems
} from "../controllers/menuController.js"

const router = express.Router()

// Public route for menu viewing
router.get("/", getAllMenuItems)

// Staff routes
router.post("/seed", staffAuth, seedMenuItems)
router.post("/", staffAuth, createMenuItem)
router.patch("/:id", staffAuth, updateMenuItem)
router.delete("/:id", staffAuth, deleteMenuItem)

export default router