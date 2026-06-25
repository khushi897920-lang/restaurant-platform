# Restaurant Platform — Frontend

React + Vite + Tailwind CSS

This README is for the frontend team. It covers how to set up, what files go where, how to talk to the backend, and what each page needs to do.

---

## Table of Contents

1. [Setup](#setup)
2. [Folder Structure](#folder-structure)
3. [How the Two Sides Work Differently](#how-the-two-sides-work-differently)
4. [How to Call the Backend API](#how-to-call-the-backend-api)
5. [What Are Tokens and Why Do They Matter](#what-are-tokens-and-why-do-they-matter)
6. [Live Updates with Socket.IO](#live-updates-with-socketio)
7. [Pages to Build](#pages-to-build)
8. [Cart Logic](#cart-logic)
9. [Quick Reference — All API Endpoints](#quick-reference--all-api-endpoints)

---

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`

Make sure the backend is also running on port 5000 before testing any API calls.

> The `.env` file in this folder already points to the backend. Do not change it unless the backend port changes.

---

## Folder Structure

```
src/
├── assets/           Put dish images here (featured dishes only)
├── data/
│   └── menu.js       The full menu — all 56 dishes as a JS object. No API needed for this.
├── context/
│   ├── CartContext.jsx     Manages the cart (what the customer is about to order)
│   └── SocketContext.jsx   One shared live connection to the backend
├── hooks/
│   ├── useStaffAuth.js     Logout helper for staff pages
│   └── useTableSession.js  Reads the table token from the URL (for customer pages)
├── components/
│   ├── ui/           Small reusable components — Button, Badge, Modal
│   ├── customer/     Components used on the menu/ordering side
│   └── staff/        Components used on the staff dashboard
├── pages/
│   ├── Landing.jsx
│   ├── Menu.jsx
│   ├── BillSummary.jsx
│   ├── Reservation.jsx
│   └── staff/
│       ├── StaffLogin.jsx
│       ├── StaffDashboard.jsx
│       └── Reservations.jsx
└── utils/
    └── api.js        Use this for ALL backend calls instead of plain fetch
```

---

## How the Two Sides Work Differently

This is the most important thing to understand about this project.

There are **two completely separate user experiences** on the same website:

---

### Customer Side

| Page | URL | Who accesses it |
|------|-----|-----------------|
| Landing | `/` | Anyone |
| Reservation | `/reservation` | Anyone |
| Menu | `/menu?token=eyJ...` | Only customers with a valid QR scan |
| Bill Summary | `/bill?token=eyJ...` | Same customer, after eating |

**The menu page is not a normal page.** It is not linked from the navbar. The only way to open it is by scanning the QR code that staff generates for a specific table. That QR code contains a `token` in the URL.

If someone tries to open `/menu` without a token (by typing it in the browser), your page should show an error and redirect them to `/`.

```jsx
// At the top of Menu.jsx — always do this check
import { useTableSession } from "../hooks/useTableSession"

export default function Menu() {
  const { isValid, redirectIfInvalid } = useTableSession()

  useEffect(() => {
    redirectIfInvalid() // sends them away if no token in URL
  }, [])

  if (!isValid) return null // don't render anything until check passes

  return (
    // your menu UI here
  )
}
```

---

### Staff Side

| Page | URL | Who accesses it |
|------|-----|-----------------|
| Staff Login | `/staff/login` | Restaurant staff only |
| Staff Dashboard | `/staff` | Staff only (redirects to login if not logged in) |
| Staff Reservations | `/staff/reservations` | Staff only |

Staff log in with a password at `/staff/login`. After logging in, a token is saved in their browser's `localStorage`. Every staff page checks for this token — if it's missing, they get redirected to login.

**This is already handled in `App.jsx`.** You do not need to add any extra logic to staff pages for this. Just build the UI.

---

## How to Call the Backend API

**Always use `api.js` — never use `fetch` directly.**

`api.js` is a pre-configured axios instance that automatically attaches the right token (staff or customer) to every request. You never have to think about tokens.

```jsx
import api from "../utils/api"

// GET request
const response = await api.get("/api/tables")
const tables = response.data

// POST request
const response = await api.post("/api/reservations", {
  name: "Raj Patel",
  phone: "9876543210",
  date: "2024-07-20",
  time: "19:30",
  guests: 4
})

// PATCH request
await api.patch(`/api/reservations/${id}`, { status: "confirmed" })
```

Wrap every call in try/catch so the page doesn't crash:

```jsx
try {
  const response = await api.get("/api/tables")
  setTables(response.data)
} catch (error) {
  console.error("Failed to load tables:", error)
  // show an error message to the user
}
```

---

## What Are Tokens and Why Do They Matter

You will hear the word "token" a lot. Here is a plain explanation.

A **token** is a long string of random-looking text, like:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0YWJsZUlkIjoiNjY...
```

It is generated by the backend and it secretly contains information like which table this is and when it expires. It cannot be faked.

**There are two types of tokens in this project:**

### 1. Staff Token
- Created when staff logs in with the password
- Stored in `localStorage` as `"staffToken"`
- Sent automatically by `api.js` on every request
- Lasts 12 hours
- **You never need to manually handle this.** Just call `localStorage.setItem("staffToken", token)` after the login API call succeeds, and `api.js` does the rest.

```jsx
// Inside StaffLogin.jsx, after successful login:
const response = await api.post("/api/auth/login", { password })
localStorage.setItem("staffToken", response.data.token)
navigate("/staff")
```

### 2. Table Token
- Created when staff assigns a table to a customer
- Lives in the URL: `/menu?token=eyJ...`
- Sent automatically by `api.js` on every request
- Lasts 8 hours
- **You never need to manually handle this either.** It's in the URL, `api.js` reads it automatically.

### The Security Part (just so you understand)

Because the token is signed by the backend, a customer cannot change `?token=abc` to `?token=xyz` and get into someone else's table. An invalid or mismatched token gets rejected by the backend and returns a 401 error. Your page should handle a 401 by showing "Session expired. Please ask staff to re-scan the QR code."

---

## Live Updates with Socket.IO

Some things on this site need to update automatically without the user refreshing:
- Staff dashboard table grid (when a table gets assigned or freed)
- Customer order status (when staff marks the order as preparing or served)
- Reservation list (when a new booking comes in)

This works through `SocketContext.jsx`, which is already set up and connected to the backend. Use the `useSocket` hook in any component:

```jsx
import { useEffect } from "react"
import { useSocket } from "../context/SocketContext"

export default function StaffDashboard() {
  const socket = useSocket()
  const [tables, setTables] = useState([])

  // Load tables on first render
  useEffect(() => {
    api.get("/api/tables").then(r => setTables(r.data))
  }, [])

  // Listen for live updates
  useEffect(() => {
    if (!socket) return

    socket.on("table:updated", () => {
      // Someone assigned or freed a table — refetch
      api.get("/api/tables").then(r => setTables(r.data))
    })

    // Cleanup when component unmounts
    return () => socket.off("table:updated")
  }, [socket])
}
```

### All Socket Events

| Event name | When it fires | What to do |
|------------|--------------|------------|
| `table:updated` | Table assigned or freed | Refetch `/api/tables` |
| `order:updated` | New items added by customer | Refetch the order for that table |
| `order:statusChanged` | Staff changed order status | Update customer's status display |
| `reservation:new` | Customer booked online | Refetch `/api/reservations` |
| `waitingList:updated` | Someone added/removed | Refetch `/api/tables/waiting` |

---

## Pages to Build

### 1. Landing.jsx — `/`

- Restaurant name + hero section
- Navbar with links: Menu (greyed out, only via QR), Reservation, Book Table button
- Featured dishes section — use `isFeatured: true` from `menu.js` to know which dishes to show here (7 dishes have this flag)
- "Book a Table" button → navigates to `/reservation`

```jsx
import { menuData } from "../data/menu"

const featured = menuData.categories
  .flatMap(c => c.items)
  .filter(item => item.isFeatured)
// This gives you the 7 featured items for the hero section
```

---

### 2. Menu.jsx — `/menu?token=...`

- Always check for token first (see the code example above)
- Import menu from `../data/menu` — no API call needed for the dish list
- Category tabs or filter buttons at the top
- Search bar that filters by dish name
- Each dish uses `<MenuCard />` component with +/− quantity controls
- Floating cart button at the bottom showing total items
- "Place Order" button → calls `POST /api/orders/add-items`
- After placing: show order status tracker (Placed → Preparing → Served)
- "Order More" button resets the cart to empty and lets them pick again (the bill keeps adding up on backend)

```jsx
import { menuData } from "../data/menu"
import { useCart } from "../context/CartContext"

// Get cart helpers
const { addItem, removeItem, getQty, getOrderPayload, clearCart } = useCart()

// Place the order
const placeOrder = async () => {
  const items = getOrderPayload(menuData) // converts cart state to array
  await api.post("/api/orders/add-items", { items })
  clearCart() // reset cart after placing
}
```

---

### 3. BillSummary.jsx — `/bill?token=...`

- Always check for token first
- Calls `GET /api/orders/my-order` on load
- Shows table number, all items ordered (across all rounds), total amount
- "Pay at Counter" message
- Greyed-out "Online Payment — Coming Soon" button

---

### 4. Reservation.jsx — `/reservation`

- Simple form: Name, Phone, Date, Time, Number of Guests
- On submit: `POST /api/reservations`
- Show success message after submitting

---

### 5. StaffLogin.jsx — `/staff/login`

- Single password input + Login button
- On submit: `POST /api/auth/login` with `{ password }`
- On success: save token to localStorage, navigate to `/staff`
- On failure: show "Wrong password" message

---

### 6. StaffDashboard.jsx — `/staff`

- Grid of 10 table cards (fetch from `GET /api/tables`)
- Each card shows: Table number, Seats (6 or 10), Status badge (Available / Occupied / Reserved)
- **Assign button** on available tables → calls `POST /api/tables/:id/assign` → shows QR modal
- **Free Table button** on occupied tables → calls `POST /api/tables/:id/free`
- Live orders panel below the grid (fetch from `GET /api/orders/all-active`)
- Waiting list section
- Listens to socket events and refetches when tables or orders change

#### QR Modal

When staff assigns a table, the backend returns a `qrDataUrl` — a base64 QR image. Just render it as an image:

```jsx
// response.data.qrDataUrl is a base64 string
<img src={response.data.qrDataUrl} alt="Table QR Code" />
```

Staff shows this screen to the customer. Customer scans with phone camera.

---

### 7. Reservations.jsx — `/staff/reservations`

- Table list of all reservations (fetch from `GET /api/reservations`)
- Each row: Name, Phone, Date, Time, Guests, Status badge
- Buttons to update status: Confirm / Mark Seated / Cancel
- Listens for `reservation:new` socket event to show new bookings live

---

## Cart Logic

The cart is managed by `CartContext.jsx` and is already written. Here is how to use it:

```jsx
import { useCart } from "../context/CartContext"

const { addItem, removeItem, getQty, getOrderPayload, clearCart, totalAmount } = useCart()

// Add one of an item
addItem("str_001")

// Remove one
removeItem("str_001")

// Get current quantity of an item (for showing on the card)
const qty = getQty("str_001")  // returns 0 if not in cart

// Get the list to send to backend when placing order
const items = getOrderPayload(menuData)
// returns: [{ itemId, name, price, qty }, ...]

// Total price of everything in cart right now
const total = totalAmount(menuData)  // returns number like 754

// Clear cart after placing order
clearCart()
```

**Important:** The cart only tracks what the customer is about to order right now. The full bill across all rounds is stored in the backend. When the customer places an order and then wants to order more, the cart resets to zero — they pick new items and the backend adds them to the existing bill automatically.

---

## Quick Reference — All API Endpoints

### No token needed (public)
| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/api/tables` | Get all 10 tables |
| POST | `/api/reservations` | Customer books a table |
| GET | `/api/tables/waiting` | Get waiting list |
| POST | `/api/tables/waiting` | Add to waiting list |

### Customer pages (token from QR URL — auto-handled by api.js)
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/orders/add-items` | Place order / order more |
| GET | `/api/orders/my-order` | Get full bill |

### Staff pages (token from login — auto-handled by api.js)
| Method | URL | What it does |
|--------|-----|-------------|
| POST | `/api/auth/login` | Staff login |
| POST | `/api/tables/:id/assign` | Assign table → get QR |
| POST | `/api/tables/:id/free` | Free table after payment |
| GET | `/api/orders/all-active` | All live orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/reservations` | All reservations |
| PATCH | `/api/reservations/:id` | Confirm / seat / cancel |
| DELETE | `/api/tables/waiting/:id` | Remove from waiting list |

---

## Contact

Backend questions — Parth  
Design decisions — your call, go wild