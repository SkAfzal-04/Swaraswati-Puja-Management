export const getToken = () => localStorage.getItem("token")

export const getRole = () => localStorage.getItem("role")

export const isAdminOrManager = () => {
  const role = getRole()
  return role === "Admin" || role === "Manager"
}
