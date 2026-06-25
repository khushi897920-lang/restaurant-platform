import express from "express"
import staffAuth from "../middleware/auth.js"
import {
  getAllTables,
  seedTables,
  assignTable,
  freeTable,
  reserveTable,
  getWaitingList,
  addToWaitingList,
  removeFromWaitingList
} from "../controllers/tableController.js"

const router = express.Router()

// Public
router.get("/", getAllTables)

// Staff only
router.post("/seed", staffAuth, seedTables)         // run once to init tables
router.post("/:id/assign", staffAuth, assignTable)  // assign → returns QR
router.post("/:id/free", staffAuth, freeTable)      // free table after payment
router.patch("/:id/reserve", staffAuth, reserveTable)

// Waiting list
router.get("/waiting", getWaitingList)
router.post("/waiting", addToWaitingList)                          // anyone can add themselves
router.delete("/waiting/:id", staffAuth, removeFromWaitingList)   // staff removes

export default router