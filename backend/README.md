# Restaurant Platform — Backend

Node.js + Express + MongoDB + Socket.IO

This README is for the backend team. It covers MongoDB setup, what every file does, and exactly which frontend files talk to the backend and how.

---

## Table of Contents

1. [MongoDB Setup (Do This First)](#mongodb-setup-do-this-first)
2. [Install and Run](#install-and-run)
3. [Project Structure — Every File Explained](#project-structure--every-file-explained)
4. [How a Request Travels Through the Backend](#how-a-request-travels-through-the-backend)
5. [Frontend Files That Connect to Backend](#frontend-files-that-connect-to-backend)
6. [Testing Without the Frontend](#testing-without-the-frontend)
7. [Common Errors and Fixes](#common-errors-and-fixes)

---

## MongoDB Setup (Do This First)

We are using **MongoDB Atlas** — a free cloud database. No local installation needed.

### Step 1 — Create an Atlas Account

Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for free. Use any email.

### Step 2 — Create a Free Cluster

1. After signing in, click **"Build a Database"**
2. Choose **Free (M0 Sandbox)** — it's the free tier, no card needed
3. Select any cloud provider (AWS is fine) and the region closest to you
4. Click **"Create"**
5. It takes about 2–3 minutes to provision

### Step 3 — Create a Database User

This is the username and password your backend uses to connect. It is NOT your Atlas login.

1. On the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** as the auth method
4. Set a username (example: `restaurant_admin`) and a password (example: `pass1234`)
5. Under "Database User Privileges", select **"Atlas admin"**
6. Click **"Add User"**

> Write down this username and password. You will need it in Step 5.

### Step 4 — Allow Network Access

By default Atlas blocks all IPs. Since this is a dev project, allow all IPs:

1. On the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access From Anywhere"** — this fills in `0.0.0.0/0` automatically
4. Click **"Confirm"**

### Step 5 — Get Your Connection String

1. On the left sidebar, click **"Database"**
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js**, Version: **5.5 or later**
5. Copy the connection string — it looks like this:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<username>` and `<password>` with what you set in Step 3
7. Add your database name before the `?` — name it `restaurant`:

```
mongodb+srv://restaurant_admin:pass1234@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
```

### Step 6 — Add It to .env

Open `backend/.env` and paste the full string as `MONGO_URI`:

```
PORT=5000
MONGO_URI=mongodb+srv://restaurant_admin:pass1234@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority
JWT_SECRET=anyLongRandomStringHere_MakeItHardToGuess
STAFF_PASSWORD=staff1234
FRONTEND_URL=http://localhost:5173
```

> **Never push `.env` to GitHub.** It is already in `.gitignore` so it will not be committed.

### Step 7 — Seed the Tables (Run Once)

After the server is running, you need to create the 10 tables in the database. Do this only once.

1. First log in as staff to get a token:

```
POST http://localhost:5000/api/auth/login
Body: { "password": "staff1234" }
```

2. Copy the token from the response, then call:

```
POST http://localhost:5000/api/tables/seed
Header: Authorization: Bearer <paste token here>
```

You will see: `"10 tables created successfully."` — done, never run this again.

---

## Install and Run

```bash
cd backend
npm install
npm run dev
```

If everything is correct you should see:

```
MongoDB connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

If you see a MongoDB error, the connection string in `.env` is wrong. Double-check the username, password, and that network access is set to allow all IPs.

---

## Project Structure — Every File Explained

```
backend/
├── .env
├── .gitignore
├── package.json
└── src/
    ├── index.js
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── Table.js
    │   ├── Order.js
    │   ├── Reservation.js
    │   └── WaitingList.js
    ├── middleware/
    │   ├── auth.js
    │   └── tableSession.js
    ├── utils/
    │   └── generateTableToken.js
    ├── controllers/
    │   ├── authController.js
    │   ├── tableController.js
    │   ├── orderController.js
    │   └── reservationController.js
    └── routes/
        ├── auth.js
        ├── tables.js
        ├── orders.js
        ├── reservations.js
        ├── menu.js
        └── payments.js
```

---

### `src/index.js` — The Entry Point

This is the first file Node runs. It does four things in order:

1. Loads environment variables from `.env`
2. Connects to MongoDB
3. Creates the Express app and Socket.IO server
4. Registers all routes and starts listening on port 5000

Every new route you create must be imported and registered here with `app.use(...)`. If you add a route file but forget to register it here, it will not work.

```js
// How routes are registered
app.use("/api/auth", authRoutes)
app.use("/api/tables", tableRoutes)
// etc.
```

Socket.IO is also exported from here (`export const io`) so controllers can emit events to the frontend.

---

### `src/config/db.js` — Database Connection

Connects to MongoDB Atlas using the `MONGO_URI` from `.env`. Called once in `index.js` at startup. If the connection fails, the whole server exits — which is intentional, since nothing works without the database.

---

### Models — The Database Schemas

Models define the shape of data stored in MongoDB. Each model = one collection in the database.

---

#### `models/Table.js`

Stores the 10 tables. Created once by the seed route.

| Field | Type | What it stores |
|-------|------|----------------|
| `tableNumber` | Number | 1 through 10 |
| `capacity` | Number | 6 or 10 (seats) |
| `status` | String | `available` / `occupied` / `reserved` |
| `currentSessionId` | String | Set when staff assigns the table. Cleared when freed. |
| `currentOrderId` | ObjectId | Points to the active Order document. |

When a table is free: `status: "available"`, `currentSessionId: null`, `currentOrderId: null`

When a table is assigned: `status: "occupied"`, `currentSessionId: "some-uuid"`, `currentOrderId: "<order _id>"`

---

#### `models/Order.js`

The most important model. One Order document per table session. Items accumulate here across multiple rounds of ordering.

| Field | Type | What it stores |
|-------|------|----------------|
| `tableId` | ObjectId | Which table this order belongs to |
| `tableNumber` | Number | Copied from the table (for easy display on staff side) |
| `sessionId` | String | Must match `currentSessionId` on the Table document |
| `items` | Array | All dishes ordered — grows with every reorder |
| `currentRound` | Number | Starts at 1, increments each time customer orders more |
| `status` | String | `active` / `billed` / `closed` |
| `totalAmount` | Number | Auto-calculated before every save |

Each item in the `items` array looks like:
```js
{ itemId: "str_001", name: "Paneer Tikka", price: 249, qty: 2, round: 1 }
```

The `round` field tracks which ordering session each item came from. Useful for staff to see which items were just added.

`totalAmount` is recalculated automatically by a `pre("save")` hook — you never set it manually.

---

#### `models/Reservation.js`

Stores customer reservations made from the website.

| Field | Type | What it stores |
|-------|------|----------------|
| `name` | String | Customer name |
| `phone` | String | Phone number |
| `date` | String | e.g. `"2024-07-20"` |
| `time` | String | e.g. `"19:30"` |
| `guests` | Number | Party size |
| `status` | String | `pending` / `confirmed` / `seated` / `cancelled` |

New reservations always start as `pending`. Staff manually changes the status from the dashboard.

---

#### `models/WaitingList.js`

Simple. Stores walk-in customers waiting for a table when everything is full.

| Field | Type | What it stores |
|-------|------|----------------|
| `name` | String | Customer name |
| `phone` | String | Phone number |
| `partySize` | Number | How many people |
| `notified` | Boolean | Has staff told them a table is ready |

---

### Middleware — Request Gatekeepers

Middleware runs before the controller. It checks something — if the check fails, it blocks the request. If it passes, it calls `next()` and the controller runs.

---

#### `middleware/auth.js` — Staff Guard

Protects routes that only staff should access. Checks for a valid staff JWT in the `Authorization` header.

How it works:
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the token using `JWT_SECRET` from `.env`
3. Checks that `decoded.role === "staff"`
4. If all good → attaches `req.staff = decoded` and calls `next()`
5. If anything fails → returns 401 and the controller never runs

Used on: all `/api/tables/:id/assign`, `/api/tables/:id/free`, `/api/orders/all-active`, `/api/reservations` (GET/PATCH/DELETE), etc.

---

#### `middleware/tableSession.js` — Customer Table Guard

Protects routes that only a customer with a valid QR session should access.

How it works:
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the JWT — extracts `tableId` and `sessionId`
3. Looks up the table in MongoDB and checks that `table.currentSessionId === sessionId`
4. This step is the security check — if staff already freed the table, the sessionId will not match and the request is rejected
5. If all good → attaches `req.tableSession = { tableId, sessionId, tableNumber }` and calls `next()`

Used on: `POST /api/orders/add-items`, `GET /api/orders/my-order`

---

### `utils/generateTableToken.js` — QR Generator

Called by `tableController.js` when staff assigns a table. Does three things:

1. Generates a unique `sessionId` using `uuid`
2. Signs a JWT containing `{ tableId, tableNumber, sessionId }` — expires in 8 hours
3. Builds the menu URL: `http://localhost:5173/menu?token=<jwt>`
4. Converts that URL into a QR code image (base64 string) using the `qrcode` package

Returns `{ sessionId, token, qrDataUrl }` — the `qrDataUrl` is what the frontend renders as `<img src={qrDataUrl} />`.

---

### Controllers — The Actual Logic

Controllers contain the business logic. They receive the request after middleware passes it, do the database work, and send the response.

---

#### `controllers/authController.js`

One function: `staffLogin`

Compares the submitted password against `STAFF_PASSWORD` in `.env`. If it matches, signs a staff JWT and returns it. Frontend stores it in `localStorage`.

---

#### `controllers/tableController.js`

| Function | What it does |
|----------|-------------|
| `getAllTables` | Returns all 10 tables sorted by number |
| `seedTables` | Deletes all tables and recreates the 10. Run once only. |
| `assignTable` | Generates session + QR, creates empty Order, updates Table to occupied |
| `freeTable` | Closes the Order, resets Table to available, clears sessionId |
| `reserveTable` | Sets table status to reserved |
| `getWaitingList` | Returns all waiting entries sorted oldest first |
| `addToWaitingList` | Adds a new entry |
| `removeFromWaitingList` | Deletes an entry by ID |

Every function that changes a table emits a `table:updated` socket event so the staff dashboard updates live without refreshing.

---

#### `controllers/orderController.js`

| Function | What it does |
|----------|-------------|
| `addItems` | Finds the active Order by sessionId, merges new items into the items array, increments currentRound |
| `getMyOrder` | Returns the full Order document for the customer's session |
| `getOrderByTable` | Staff view — returns the active order for a specific table number |
| `getAllActiveOrders` | Returns all orders with status `active` |
| `updateOrderStatus` | Staff marks order as `billed` or `closed` |

**How reorders work in `addItems`:** When a customer orders more, it finds the same Order document using `sessionId`. New items are pushed into the same `items` array with the updated `round` number. The total is recalculated. Nothing from the previous round is touched or lost.

---

#### `controllers/reservationController.js`

| Function | What it does |
|----------|-------------|
| `createReservation` | Saves a new reservation, emits `reservation:new` socket event to staff |
| `getAllReservations` | Returns all reservations newest first |
| `updateReservationStatus` | Staff changes status: confirmed / seated / cancelled |
| `deleteReservation` | Staff deletes a reservation |

---

### Routes — URL to Controller Mapping

Routes connect URLs to controllers. Each route file handles one resource.

| File | Base URL | Who uses it |
|------|----------|-------------|
| `routes/auth.js` | `/api/auth` | Staff login |
| `routes/tables.js` | `/api/tables` | Staff dashboard + waiting list |
| `routes/orders.js` | `/api/orders` | Customer ordering + staff order view |
| `routes/reservations.js` | `/api/reservations` | Customer booking form + staff reservations page |
| `routes/menu.js` | `/api/menu` | Placeholder — not used, menu is frontend JSON |
| `routes/payments.js` | `/api/payments` | Stub — returns "coming soon" for now |

---

## How a Request Travels Through the Backend

Example: Customer places an order.

```
Customer taps "Place Order" on their phone
         ↓
Frontend (api.js) sends:
  POST /api/orders/add-items
  Header: Authorization: Bearer eyJ... (the table token from QR URL)
  Body: { items: [{ itemId, name, price, qty }] }
         ↓
index.js receives the request
  → Matches /api/orders → hands off to orders.js route file
         ↓
orders.js route: POST /add-items
  → Runs tableSession middleware first
         ↓
tableSession middleware:
  → Reads token from Authorization header
  → Verifies it with JWT_SECRET
  → Looks up the table in MongoDB
  → Checks sessionId still matches (table has not been freed)
  → Attaches req.tableSession = { tableId, sessionId, tableNumber }
  → Calls next()
         ↓
orderController.js → addItems function:
  → Finds Order where sessionId matches and status is "active"
  → Merges new items into the items array
  → Recalculates totalAmount
  → Saves to MongoDB
  → Emits "order:updated" socket event → staff dashboard refreshes live
  → Returns the updated order
         ↓
Frontend receives the response
  → Clears the cart
  → Shows order status tracker
```

---

## Frontend Files That Connect to Backend

These are the exact frontend files that make API calls or listen to socket events.

---

### `frontend/src/utils/api.js` — The Bridge

Every single API call in the entire frontend goes through this file. It is a pre-configured axios instance that automatically attaches the right token to every request. Neither staff pages nor customer pages manually manage tokens.

---

### `frontend/src/context/SocketContext.jsx`

Opens one Socket.IO connection to `http://localhost:5000` when the app loads. Shared across all pages. Pages that need live updates import `useSocket()` from here.

---

### Pages and What They Call

| Frontend Page | API Calls | Socket Events Listened |
|---------------|-----------|----------------------|
| `StaffLogin.jsx` | `POST /api/auth/login` | none |
| `StaffDashboard.jsx` | `GET /api/tables` `POST /api/tables/:id/assign` `POST /api/tables/:id/free` `GET /api/orders/all-active` `GET /api/tables/waiting` `DELETE /api/tables/waiting/:id` | `table:updated` `order:updated` `waitingList:updated` |
| `Reservations.jsx` (staff) | `GET /api/reservations` `PATCH /api/reservations/:id` | `reservation:new` |
| `Menu.jsx` | `POST /api/orders/add-items` | none (status shown on BillSummary) |
| `BillSummary.jsx` | `GET /api/orders/my-order` | `order:statusChanged` |
| `Reservation.jsx` (customer) | `POST /api/reservations` | none |

### Files That Do NOT Call the Backend

| Frontend File | Why |
|---------------|-----|
| `src/data/menu.js` | Static JSON file — the full menu lives here, no API needed |
| `src/context/CartContext.jsx` | Pure React state — tracks what customer selected before ordering |
| `src/hooks/useTableSession.js` | Just reads the token from the URL, no network call |
| `src/hooks/useStaffAuth.js` | Just reads from localStorage, no network call |

---

## Testing Without the Frontend

Use **Thunder Client** (VS Code extension) or Postman. Here is the exact sequence to test the full customer flow:

**1. Login as staff**
```
POST http://localhost:5000/api/auth/login
Body (JSON): { "password": "staff1234" }
→ Copy the token from the response
```

**2. Check all tables exist**
```
GET http://localhost:5000/api/tables
→ Should show 10 tables, all available
→ Copy the _id of any table
```

**3. Assign a table**
```
POST http://localhost:5000/api/tables/<table _id>
Header: Authorization: Bearer <staff token>
→ Response includes qrDataUrl (base64 image) and a token field
→ Copy the token field — this is the customer's table token
```

**4. Place an order as customer**
```
POST http://localhost:5000/api/orders/add-items
Header: Authorization: Bearer <table token from step 3>
Body (JSON):
{
  "items": [
    { "itemId": "str_001", "name": "Paneer Tikka", "price": 249, "qty": 2 },
    { "itemId": "brd_002", "name": "Garlic Naan", "price": 69, "qty": 3 }
  ]
}
→ Should return the order with totalAmount: 705
```

**5. Get the bill**
```
GET http://localhost:5000/api/orders/my-order
Header: Authorization: Bearer <same table token>
→ Shows all items and total
```

**6. Free the table**
```
POST http://localhost:5000/api/tables/<same table _id>/free
Header: Authorization: Bearer <staff token>
→ Table goes back to available
→ If you now try step 5 again with the old table token, you get 401 — session is dead
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MongoServerError: bad auth` | Wrong username or password in MONGO_URI | Check `.env` — passwords with `@` or `#` need to be URL-encoded |
| `MongooseServerSelectionError` | Network access not allowed on Atlas | Add `0.0.0.0/0` in Atlas Network Access |
| `ECONNREFUSED` on frontend | Backend not running | Run `npm run dev` in the backend folder |
| `401 No token` | Forgot Authorization header in Thunder Client | Add `Authorization: Bearer <token>` to headers tab |
| `401 Session expired` | Staff freed the table, customer still has old QR | Ask staff to assign the table again to generate a new QR |
| `Cannot GET /api/...` | Route not registered in `index.js` | Import the route file and add `app.use(...)` in index.js |
| `Cast to ObjectId failed` | Passed a string that is not a valid MongoDB ID | Use the real `_id` copied from a GET response |
| CORS error in browser | `FRONTEND_URL` in `.env` does not match where React is running | Make sure `.env` says `http://localhost:5173` exactly, no trailing slash |
| `Cannot find module uuid` | uuid not installed | Run `npm install` again inside the backend folder |