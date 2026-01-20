import { Routes, Route } from "react-router-dom"
import { useState } from "react"
import { Toaster } from "react-hot-toast"

import { useAuth } from "./context/AuthContext"

import Navbar from "./components/Navbar"
import LoginModal from "./components/LoginModal"
import SplashScreen from "./components/SplashScreen"

import Home from "./pages/Home"
import Members from "./pages/Members"
import ChangePassword from "./pages/ChangePassword"
import Budget from "./pages/Budget"

export default function App() {
  const { role } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      <Toaster position="top-right" />

      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {!showSplash && (
        <>
          <Navbar onLoginClick={() => setShowLogin(true)} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/budget" element={<Budget />} />
          </Routes>

          {showLogin && (
            <LoginModal onClose={() => setShowLogin(false)} />
          )}
        </>
      )}
    </>
  )
}
