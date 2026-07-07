import express from "express"
import tableSession from "../middleware/tableSession.js"

const router = express.Router()

// POST /api/payments/create-intent
// STUBBED — returns mock success for now
// When ready: install stripe, add STRIPE_SECRET_KEY to .env, replace this
router.post("/create-intent", tableSession, async (req, res) => {
  res.json({
    message: "Online payments coming soon. Please pay at the counter.",
    stub: true
  })
})

export default router

/*
  TO ADD STRIPE LATER:

  import Stripe from "stripe"
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  router.post("/create-intent", tableSession, async (req, res) => {
    const order = await Order.findOne({ sessionId: req.tableSession.sessionId })
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 100,  // Stripe uses paise (smallest unit)
      currency: "inr",
    })
    res.json({ clientSecret: paymentIntent.client_secret })
  })
*/