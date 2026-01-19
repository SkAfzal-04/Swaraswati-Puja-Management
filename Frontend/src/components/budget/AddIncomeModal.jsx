import { useState, useEffect } from "react"
import { addIncome, updateIncome } from "../../services/transactionApi"

export default function AddIncomeModal({ onClose, fetchData, editData = null }) {
  const isEdit = Boolean(editData)

  const [amount, setAmount] = useState("")
  const [para, setPara] = useState("")
  const [type, setType] = useState("Chanda")
  const [isPaid, setIsPaid] = useState(true)
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [memberId, setMemberId] = useState("")
  const [pujaYear, setPujaYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  /* ---------- Prefill for edit ---------- */
  useEffect(() => {
    if (!editData) return

    setAmount(editData.amount ?? "")
    setPara(editData.para ?? "")
    setType(editData.type ?? "Chanda")
    setIsPaid(editData.paymentStatus === "Paid")
    setPujaYear(editData.pujaYear ?? new Date().getFullYear())
    setMemberId(editData.member?._id ?? "")
    setName(editData.donor?.name || editData.member?.name || "")
    setPhoneNumber(editData.donor?.phoneNumber || editData.member?.phone || "")
  }, [editData])

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!amount || !para || !type || !pujaYear) {
      setError("Please fill all required fields")
      return
    }

    if (!memberId && (!name || !phoneNumber)) {
      setError("Please enter donor name and phone number")
      return
    }

    const payload = {
      amount: Number(amount),
      para,
      type,
      isPaid,
      pujaYear: Number(pujaYear),
      memberId: memberId || undefined,
      name: memberId ? undefined : name,
      phoneNumber: memberId ? undefined : phoneNumber,
    }

    try {
      setLoading(true)
      if (isEdit) {
        await updateIncome(editData._id, payload)
      } else {
        await addIncome(payload)
      }
      fetchData?.()
      onClose()
    } catch (err) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  /* ---------- Button & Input Styles ---------- */
  const btnBase =
    "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95"

  const btnPrimary =
    `${btnBase} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500`
  const btnSecondary =
    `${btnBase} bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md focus:ring-gray-400`
  const inputPrimary =
    "w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md rounded-xl shadow-lg max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">
            {isEdit ? "Edit Contribution" : "Add Contribution"}
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && <p className="text-red-500">{error}</p>}

          <Input label="Amount *" type="number" value={amount} onChange={setAmount} inputClass={inputPrimary} />
          <Input label={`Donor Name ${memberId ? "" : "*"}`} value={name} onChange={setName} inputClass={inputPrimary} />
          <Input label={`Phone Number ${memberId ? "" : "*"}`} type="tel" value={phoneNumber} onChange={setPhoneNumber} inputClass={inputPrimary} />
          <Input label="Para *" value={para} onChange={setPara} inputClass={inputPrimary} />

          <div>
            <label className="block mb-1 font-medium">Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputPrimary}>
              <option value="Chanda">Chanda</option>
              <option value="Donation">Donation</option>
            </select>
          </div>

          <Input label="Puja Year *" type="number" value={pujaYear} onChange={setPujaYear} inputClass={inputPrimary} />

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
            <span>Mark as Paid</span>
          </label>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3">
          <button type="button" onClick={onClose} className={btnSecondary + " w-full"}>
            Cancel
          </button>

          <button type="submit" disabled={loading} className={btnPrimary + " w-full"}>
            {loading ? "Saving..." : isEdit ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  )
}

/* ---------- Small reusable input ---------- */
function Input({ label, type = "text", value, onChange, inputClass }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  )
}
