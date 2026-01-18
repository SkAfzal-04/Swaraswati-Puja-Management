import { getToken } from "./auth"

const API_URL = import.meta.env.VITE_API_URL

export const apiFetch = async (url, options = {}) => {
  const token = getToken()

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "Request failed")
  }

  return res.json()
}
