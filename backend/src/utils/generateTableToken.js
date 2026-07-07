import jwt from "jsonwebtoken"
import QRCode from "qrcode"
import { v4 as uuidv4 } from "uuid"

// Call this when staff assigns a table
// Returns: { sessionId, token, qrDataUrl }
export const generateTableToken = async (tableId, tableNumber) => {
  const sessionId = uuidv4()  // unique per session e.g. "a1b2-c3d4-..."

  // JWT contains tableId + sessionId, expires in 8 hours
  const token = jwt.sign(
    { tableId, tableNumber, sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  )

  // The URL customer scans
  const menuUrl = `${process.env.FRONTEND_URL}/menu?token=${token}`

  // Generate QR as base64 image — frontend renders it as <img src={qrDataUrl} />
  const qrDataUrl = await QRCode.toDataURL(menuUrl)

  return { sessionId, token, qrDataUrl }
}