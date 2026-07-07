import jwt from "jsonwebtoken"
import Table from "../models/Table.js"

// Attach this to customer routes that need a valid table session
// Verifies the token from the QR code URL
const tableSession = async (req, res, next) => {
  // Token comes from Authorization header: "Bearer eyJ..."
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No session token. Scan the QR code to access the menu." })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { tableId, sessionId } = decoded

    // Check that the table's currentSessionId still matches
    // If staff freed the table, sessionId won't match → session is dead
    const table = await Table.findById(tableId)

    if (!table) {
      return res.status(404).json({ error: "Table not found." })
    }

    if (table.currentSessionId !== sessionId || (table.status !== 'occupied' && table.status !== 'reserved')) {
      return res.status(401).json({
        error: "Session expired. This table has been reset by staff.",
        sessionEnded: true,
        status: "closed"
      })
    }

    // Attach to request so controllers can use it
    req.tableSession = { tableId, sessionId, tableNumber: decoded.tableNumber }
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please scan the QR code again." })
  }
}

export default tableSession