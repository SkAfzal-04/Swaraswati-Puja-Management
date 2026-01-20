import { useEffect, useState } from "react"
import { addExpense, updateExpense } from "../../services/transactionApi"

export default function AddExpenseModal({ onClose, fetchData, editData }) {
  const isEdit = Boolean(editData)

  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [paymentMode, setPaymentMode] = useState("Cash")
  const [pujaYear, setPujaYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ---------- PREFILL ON EDIT ---------- */
  useEffect(() => {
    if (!editData) return

    setAmount(editData.amount ?? "")
    setCategory(editData.category ?? "")
    setPaymentMode(editData.paymentMode ?? "Cash")
    setPujaYear(editData.pujaYear ?? new Date().getFullYear())
  }, [editData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!amount || !category || !pujaYear) {
      setError("Required fields missing")
      return
    }

    try {
      setLoading(true)

      const payload = {
        amount: Number(amount),
        category,
        paymentMode,
        pujaYear: Number(pujaYear),
      }

      if (isEdit) {
        await updateExpense(editData._id, payload)
      } else {
        await addExpense(payload)
      }

      fetchData?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl"
      >
        <div className="px-5 py-4 border-b bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Expense" : "Add Expense"}
          </h2>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <p className="text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          <Input label="Amount *" type="number" value={amount} onChange={setAmount} />

          <Input
            label="Category *"
            value={category}
            onChange={setCategory}
            placeholder="Decoration, Food, Sound"
          />

          <div>
            <label className="block mb-1 font-semibold">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-lg border-2 border-orange-300 px-3 py-2"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank">Bank</option>
            </select>
          </div>

          <Input
            label="Puja Year *"
            type="number"
            value={pujaYear}
            onChange={setPujaYear}
          />
        </div>

        <div className="flex gap-3 px-5 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="w-full border rounded-lg py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2 text-white bg-gradient-to-r from-red-500 to-orange-500"
          >
            {loading ? "Saving..." : isEdit ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block mb-1 font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-2 border-blue-300 px-3 py-2"
      />
    </div>
  )
}
