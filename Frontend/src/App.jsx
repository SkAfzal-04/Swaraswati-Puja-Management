import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"


import Navbar from "./components/Navbar"
import LoginModal from "./components/LoginModal"

import Home from "./pages/Home"
import Members from "./pages/Members"
import ChangePassword from "./pages/ChangePassword"

export default function App() {
  const [role, setRole] = useState(null)
  const [showLogin, setShowLogin] = useState(false)

  // 🔄 Restore login on refresh
  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    if (savedRole) setRole(savedRole)
  }, [])

  const handleLoginSuccess = role => {
    setRole(role)
    setShowLogin(false)
  }

  return (
    <>
    <Toaster position="top-right" />
      <Navbar
        role={role}
        onLoginClick={() => setShowLogin(true)}
        setRole={setRole}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/members" element={<Members />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>

      {/* ✅ LOGIN MODAL (GLOBAL) */}
      {showLogin && (
        <LoginModal
          onLogin={handleLoginSuccess}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  )
}
