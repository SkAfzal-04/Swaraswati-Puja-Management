import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext" // ✅ use auth context

export default function Navbar({ onLoginClick }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // ✅ Get auth state from context
  const { role, logout: contextLogout } = useAuth()

  const logout = () => {
    contextLogout() // call context logout
    toast.success("Logged out successfully 👋")
    navigate("/")
    setOpen(false)
  }

  const baseBtn =
    "px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200"

  const NavLinks = ({ mobile = false }) => (
    <div
      className={`${
        mobile ? "flex flex-col gap-4" : "flex items-center gap-4"
      }`}
    >
      <Link
        to="/members"
        onClick={() => setOpen(false)}
        className={`${baseBtn} text-white hover:bg-white/20`}
      >
        Members
      </Link>

      <Link
        to="/budget"
        onClick={() => setOpen(false)}
        className={`${baseBtn} text-white hover:bg-white/20`}
      >
        Budget
      </Link>

      {(role === "Admin" || role === "Manager") && (
        <Link
          to="/change-password"
          onClick={() => setOpen(false)}
          className={`${baseBtn} bg-black/80 text-white hover:bg-black`}
        >
          Change Password
        </Link>
      )}

      {!role ? (
        <button
          onClick={() => {
            onLoginClick()
            setOpen(false)
          }}
          className={`${baseBtn} bg-black/80 text-white hover:bg-black`}
        >
          Login
        </button>
      ) : (
        <button
          onClick={logout}
          className={`${baseBtn} bg-red-600/90 text-white hover:bg-red-600`}
        >
          Logout
        </button>
      )}
    </div>
  )

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 text-white shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO + TITLE */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Saraswati Puja Logo"
            className="h-10 w-auto object-contain rounded-full"
          />
          <span className="text-lg sm:text-2xl font-extrabold tracking-wide">
            Panchra Saraswati Puja
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "60vh", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-orange-500 px-4 py-6 overflow-y-auto"
          >
            <NavLinks mobile />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
