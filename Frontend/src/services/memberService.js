import { apiFetch } from "../utils/api"

export const fetchMembers = () =>
  apiFetch("/members")

export const addMember = (data) =>
  apiFetch("/members", {
    method: "POST",
    body: JSON.stringify(data)
  })

export const updateMember = (id, data) =>
  apiFetch(`/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })

export const deleteMember = (id) =>
  apiFetch(`/members/${id}`, {
    method: "DELETE"
  })
