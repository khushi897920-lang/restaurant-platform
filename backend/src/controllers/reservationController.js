import Reservation from "../models/Reservation.js"
import { io } from "../index.js"

// POST /api/reservations
// Public — customer books a table from the website
export const createReservation = async (req, res) => {
  try {
    const { name, phone, date, time, guests } = req.body

    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: "All fields are required." })
    }

    const reservation = await Reservation.create({ name, phone, date, time, guests })

    // Notify staff dashboard of new reservation
    io.emit("reservation:new", reservation)

    res.status(201).json({
      message: "Reservation booked successfully. We will confirm shortly.",
      reservation
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/reservations
// Staff sees all reservations — sorted by newest first
// Protected by staffAuth
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 })
    res.json(reservations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /api/reservations/:id
// Staff updates status: confirmed / seated / cancelled
// Protected by staffAuth
export const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "seated", "cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status." })
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!reservation) return res.status(404).json({ error: "Reservation not found." })

    res.json(reservation)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/reservations/:id
// Staff deletes a reservation (optional)
// Protected by staffAuth
export const deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id)
    res.json({ message: "Reservation deleted." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}