import mongoose from "mongoose"

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true   // 6 or 10
  },
  status: {
    type: String,
    enum: ["available", "occupied", "reserved", "cleaning"],
    default: "available"
  },
  // Set when staff assigns a table — cleared on free
  currentSessionId: {
    type: String,
    default: null
  },
  // Points to the active Order document
  currentOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },
  guestName: {
    type: String,
    default: ""
  },
  arrivalTime: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  waiter: {
    type: String,
    default: "Rahul Sharma"
  },
  guestCount: {
    type: Number,
    default: 0
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    default: null
  },
  qrDataUrl: {
    type: String,
    default: ""
  },
  token: {
    type: String,
    default: ""
  }
}, { timestamps: true })

export default mongoose.model("Table", tableSchema)