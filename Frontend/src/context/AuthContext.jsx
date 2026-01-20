import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedRole = localStorage.getItem("role")
    const savedToken = localStorage.getItem("token")

    if (savedRole) setRole(savedRole)
    if (savedToken) setToken(savedToken)

    setLoading(false)
  }, [])

  const login = ({ role, token }) => {
    localStorage.setItem("role", role)
    localStorage.setItem("token", token)
    setRole(role)
    setToken(token)
  }

  const logout = () => {
    localStorage.removeItem("role")
    localStorage.removeItem("token")
    setRole(null)
    setToken(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        isAuthenticated: !!token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook (clean usage)
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return ctx
}
