import mongoose from "mongoose"
import Reservation from "./src/models/Reservation.js"

const MONGO_URI = "mongodb://localhost:27017/restaurant"

const run = async () => {
  await mongoose.connect(MONGO_URI)
  const list = await Reservation.find({}).sort({ createdAt: -1 })
  console.log("ALL RESERVATIONS IN DB:")
  list.forEach(r => {
    console.log(`ID: ${r._id} | Name: ${r.name} | Date: "${r.date}" | Status: ${r.status} | Source: ${r.source}`)
  })
  const today = new Date().toISOString().split("T")[0]
  console.log(`Server today computed as: "${today}"`)
  await mongoose.connection.close()
}

run()
