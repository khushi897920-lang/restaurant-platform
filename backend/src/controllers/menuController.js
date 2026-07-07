import MenuItem from "../models/MenuItem.js"
import { Server } from "socket.io"

let io;
export const setMenuIo = (socketIo) => { io = socketIo; }

export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find()
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body)
    if (io) io.emit("menu:updated", { action: "create", item })
    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: "Item not found" })
    if (io) io.emit("menu:updated", { action: "update", item })
    res.json(item)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: "Item not found" })
    if (io) io.emit("menu:updated", { action: "delete", id: req.params.id })
    res.json({ message: "Item deleted successfully" })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const seedMenuItems = async (req, res) => {
  try {
    const count = await MenuItem.countDocuments()
    if (count > 0) return res.status(400).json({ message: "Menu already seeded" })
    
    // We will let the frontend define the initial seed in context, or just return empty for now.
    // In production, we'd have a seed array here.
    res.json({ message: "Seed endpoint hit. Send items via POST to seed manually." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
