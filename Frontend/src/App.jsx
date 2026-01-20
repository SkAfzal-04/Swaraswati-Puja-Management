import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"

import Navbar from "./components/Navbar"
import LoginModal from "./components/LoginModal"
import SplashScreen from "./components/SplashScreen" // 🔥 NEW

import Home from "./pages/Home"
import Members from "./pages/Members"
import ChangePassword from "./pages/ChangePassword"
import Budget from "./pages/Budget"

export default function App() {
  const [role, setRole] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSplash, setShowSplash] = useState(true) // 🔥 splash state

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
      {/* 🔥 TOASTER */}
      <Toaster position="top-right" />

      {/* 🔥 SPLASH SCREEN */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 🔥 MAIN APP */}
      {!showSplash && (
        <>
          <Navbar
            role={role}
            onLoginClick={() => setShowLogin(true)}
            setRole={setRole}
          />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/budget" element={<Budget />} />
          </Routes>

          {/* ✅ LOGIN MODAL */}
          {showLogin && (
            <LoginModal
              onLogin={handleLoginSuccess}
              onClose={() => setShowLogin(false)}
            />
          )}
        </>
      )}
    </>
  )
}
