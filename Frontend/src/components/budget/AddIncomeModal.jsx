import { useState } from "react"
import { addIncome } from "../../services/transactionApi"

export default function AddIncomeModal({ onClose, fetchData }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!amount || !para || !type || !pujaYear) {
      setError("Please fill all required fields")
      return
    }

    // If public donor (no member), name & phone required
    if (!memberId && (!name || !phoneNumber)) {
      setError("Please enter donor name and phone number")
      return
    }

    setLoading(true)
    try {
      await addIncome({
        amount: parseFloat(amount),
        para,
        type,
        isPaid,
        name: name || undefined,
        phoneNumber: phoneNumber || undefined,
        memberId: memberId || undefined,
        pujaYear: Number(pujaYear)
      })
      fetchData?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to add income")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Contribution</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Amount */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Amount *</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-primary w-full"
            />
          </div>

          {/* Donor Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Donor Name {memberId ? "" : "*"}</label>
            <input
              type="text"
              placeholder="Enter donor name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-primary w-full"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone Number {memberId ? "" : "*"}</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="input-primary w-full"
            />
          </div>

          {/* Para */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Para *</label>
            <input
              type="text"
              placeholder="Enter para"
              value={para}
              onChange={(e) => setPara(e.target.value)}
              className="input-primary w-full"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-primary w-full"
            >
              <option value="Chanda">Chanda</option>
              <option value="Donation">Donation</option>
            </select>
          </div>

          {/* Puja Year */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Puja Year *</label>
            <input
              type="number"
              placeholder="Enter Puja Year"
              value={pujaYear}
              onChange={(e) => setPujaYear(e.target.value)}
              className="input-primary w-full"
            />
          </div>

          {/* Paid Checkbox */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-gray-700">Mark as Paid</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
