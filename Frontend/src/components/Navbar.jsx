import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import toast from "react-hot-toast"

export default function Navbar({ role, setRole, onLoginClick }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setRole(null)

    toast.success("Logged out successfully 👋")
    navigate("/")
    setOpen(false)
  }

  const baseBtn =
    "px-3 py-1 rounded-md text-sm font-semibold transition hover:opacity-90"

  const NavLinks = ({ mobile = false }) => (
    <div
      className={`${
        mobile
          ? "flex flex-col gap-3"
          : "flex items-center gap-4"
      }`}
    >
      {/* Members */}
      <Link
        to="/members"
        onClick={() => setOpen(false)}
        className={`${baseBtn} bg-white text-orange-600`}
      >
        Members
      </Link>

      {/* Budget */}
      <Link
        to="/budget"
        onClick={() => setOpen(false)}
        className={`${baseBtn} bg-white text-orange-600`}
      >
        Budget
      </Link>

      {/* Change Password */}
      {(role === "Admin" || role === "Manager") && (
        <Link
          to="/change-password"
          onClick={() => setOpen(false)}
          className={`${baseBtn} bg-black text-white px-2 py-1 text-xs`}
        >
          Change Password
        </Link>
      )}

      {/* Login / Logout */}
      {!role ? (
        <button
          onClick={() => {
            onLoginClick()
            setOpen(false)
          }}
          className={`${baseBtn} bg-black text-white px-2 py-1 text-xs`}
        >
          Login
        </button>
      ) : (
        <button
          onClick={logout}
          className={`${baseBtn} bg-red-600 text-white px-2 py-1 text-xs`}
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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-extrabold">
          🎓 Saraswati Puja Club
        </Link>

        {/* Desktop */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu (60% height) */}
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
