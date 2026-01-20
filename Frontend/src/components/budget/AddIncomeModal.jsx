import { useState, useEffect } from "react"
import { addIncome, updateIncome } from "../../services/transactionApi"

export default function AddIncomeModal({ onClose, fetchData, editData = null }) {
  const isEdit = Boolean(editData)

  /* ---------------- State ---------------- */
  const [amount, setAmount] = useState("")
  const [previousPaid, setPreviousPaid] = useState(0)
  const [newPaid, setNewPaid] = useState("")
  const [para, setPara] = useState("") // Optional now
  const [type, setType] = useState("Chanda")
  const [name, setName] = useState("")
  const [memberId, setMemberId] = useState("")
  const [pujaYear, setPujaYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ---------------- Prefill (Edit) ---------------- */
  useEffect(() => {
    if (!editData) return

    setAmount(editData.amount ?? "")
    setPreviousPaid(Number(editData.paidAmount ?? 0))
    setPara(editData.para ?? "")
    setType(editData.type ?? "Chanda")
    setPujaYear(editData.pujaYear ?? new Date().getFullYear())
    setMemberId(editData.member?._id ?? "")

    // Safe fallback for name
    setName(
      editData.donor?.name ||
        editData.member?.name ||
        editData.name ||
        ""
    )
  }, [editData])

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!amount || !type || !pujaYear) {
      setError("Please fill all required fields")
      return
    }

    if (!memberId && !name) {
      setError("Please enter a name")
      return
    }

    const totalAmount = Number(amount)
    const addedPaid = Number(newPaid || 0)
    const finalPaidAmount = isEdit
      ? previousPaid + addedPaid
      : addedPaid

    if (finalPaidAmount > totalAmount) {
      setError("Total paid amount cannot exceed total amount")
      return
    }

    const payload = {
      amount: totalAmount,
      paidAmount: finalPaidAmount,
      paymentStatus:
        finalPaidAmount >= totalAmount ? "Paid" : "Due",
      para: para || "", // Optional
      type,
      pujaYear: Number(pujaYear),
      memberId: memberId || undefined,
      name: memberId ? undefined : name
    }

    try {
      setLoading(true)
      isEdit
        ? await updateIncome(editData._id, payload)
        : await addIncome(payload)

      fetchData?.()
      onClose()
    } catch (err) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI Classes ---------------- */
  const inputClass =
    "w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"

  const btn =
    "w-full rounded-lg px-3 py-2 font-medium transition"

  /* ---------------- Render ---------------- */
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md max-h-[90vh] rounded-xl shadow-lg flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b shrink-0">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Income" : "Add Income"}
          </h2>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <Input label="Total Amount *" type="number" value={amount} onChange={setAmount} inputClass={inputClass} />

          {isEdit && (
            <Input
              label="Previously Paid"
              type="number"
              value={previousPaid}
              disabled
              inputClass={inputClass + " bg-gray-100"}
            />
          )}

          <Input
            label={isEdit ? "Add New Payment" : "Paid Amount *"}
            type="number"
            value={newPaid}
            onChange={setNewPaid}
            inputClass={inputClass}
          />

          {isEdit && (
            <p className="text-sm text-gray-600">
              Final Paid Amount:{" "}
              <strong>{previousPaid + Number(newPaid || 0)}</strong>
            </p>
          )}

          <Input label={`Name ${memberId ? "" : "*"}`} value={name} onChange={setName} inputClass={inputClass} />

          <Input label="Para" value={para} onChange={setPara} inputClass={inputClass} />

          <div>
            <label className="block mb-1 font-medium">Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              <option value="Chanda">Chanda</option>
              <option value="Donation">Donation</option>
            </select>
          </div>

          <Input label="Puja Year *" type="number" value={pujaYear} onChange={setPujaYear} inputClass={inputClass} />

          <p className="text-sm font-medium">
            Status:{" "}
            <span className={previousPaid + Number(newPaid || 0) >= amount ? "text-green-600" : "text-orange-600"}>
              {previousPaid + Number(newPaid || 0) >= amount ? "Paid" : "Due"}
            </span>
          </p>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className={btn + " bg-gray-200"}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className={btn + " bg-blue-600 text-white"}>
            {loading ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---------------- Input ---------------- */
function Input({ label, type = "text", value, onChange, inputClass, disabled = false }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputClass}
      />
    </div>
  )
}
