import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"

import tableRoutes from "./routes/tables.js"
import orderRoutes from "./routes/orders.js"
import reservationRoutes from "./routes/reservations.js"
import menuRoutes from "./routes/menu.js"
import authRoutes from "./routes/auth.js"
import paymentRoutes from "./routes/payments.js"

dotenv.config()
connectDB()

const app = express()
const httpServer = createServer(app)

// Socket.IO — attached to the same HTTP server
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
})

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`)
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tables", tableRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/reservations", reservationRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/payments", paymentRoutes)

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Restaurant API is running" })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})