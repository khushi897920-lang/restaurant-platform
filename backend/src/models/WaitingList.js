import mongoose from "mongoose"

const waitingListSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  phone:      { type: String, required: true },
  partySize:  { type: Number, required: true },
  notified:   { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model("WaitingList", waitingListSchema)