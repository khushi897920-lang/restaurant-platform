import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { CartProvider } from "./context/CartContext"
import { SocketProvider } from "./context/SocketContext"

import Landing from "./pages/Landing"
import Menu from "./pages/Menu"
import BillSummary from "./pages/BillSummary"
import Reservation from "./pages/Reservation"
import StaffLogin from "./pages/staff/StaffLogin"
import StaffDashboard from "./pages/staff/StaffDashboard"
import Reservations from "./pages/staff/Reservations"

// Blocks customer from accessing /staff/* routes without a token
function StaffRoute({ children }) {
  const token = localStorage.getItem("staffToken")
  return token ? children : <Navigate to="/staff/login" replace />
}

export default function App() {
  return (
    <SocketProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/reservation" element={<Reservation />} />

            {/* Customer — QR accessed, token in URL */}
            <Route path="/menu" element={<Menu />} />
            <Route path="/bill" element={<BillSummary />} />

            {/* Staff — password protected */}
            <Route path="/staff/login" element={<StaffLogin />} />
            <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            <Route path="/staff/reservations" element={<StaffRoute><Reservations /></StaffRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </SocketProvider>
  )
}