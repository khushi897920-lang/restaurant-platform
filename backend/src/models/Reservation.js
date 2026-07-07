import mongoose from "mongoose"

const reservationSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  phone:  { type: String, required: true },
  date:   { type: String, required: true },  // "2024-07-15"
  time:   { type: String, required: true },  // "19:30"
  guests: { type: Number, required: true },
  notes:  { type: String, default: "" },      // Special request
  source: { type: String, enum: ["Customer", "Walk-in"], default: "Customer" },
  arrivalTime: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "confirmed", "seated", "cancelled", "Waiting", "rejected"],
    default: "pending"
  }
}, { timestamps: true })

export default mongoose.model("Reservation", reservationSchema)