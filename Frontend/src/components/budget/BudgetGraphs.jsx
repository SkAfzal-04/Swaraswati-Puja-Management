import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

import {
  getParaGraph,
  getDayGraph,
  getIncomeVsExpense,
} from "../../services/transactionApi"

export default function BudgetGraphs() {
  const [paraData, setParaData] = useState([])
  const [dayData, setDayData] = useState([])
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState([])
  const colors = ["#4f46e5", "#f97316", "#10b981", "#e11d48", "#facc15"]

  useEffect(() => {
    fetchGraphs()
  }, [])

  const fetchGraphs = async () => {
    try {
      const para = await getParaGraph()
      const day = await getDayGraph()
      const incomeVsExpense = await getIncomeVsExpense()

      setParaData(para)
      setDayData(day)

      // Transform backend object into array for charts
      setIncomeVsExpenseData([
        { _id: "Income", total: incomeVsExpense.totalIncome || 0 },
        { _id: "Expense", total: incomeVsExpense.totalExpense || 0 },
      ])
    } catch (err) {
      console.error("Failed to fetch graph data:", err)
    }
  }

  return (
    <div className="space-y-8">
      {/* ===================== PARA-WISE COLLECTION ===================== */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Para-wise Collection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paraData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="_id" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip
              contentStyle={{ backgroundColor: "#f3f4f6", borderRadius: "8px" }}
              cursor={{ fill: "rgba(79, 70, 229, 0.1)" }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {paraData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===================== DAY-WISE COLLECTION ===================== */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Day-wise Collection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dayData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="_id" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fef3c7", borderRadius: "8px" }}
              cursor={{ fill: "rgba(251, 191, 36, 0.1)" }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {dayData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===================== INCOME VS EXPENSE ===================== */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Income vs Expense</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={incomeVsExpenseData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="_id" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip
              contentStyle={{ backgroundColor: "#d1fae5", borderRadius: "8px" }}
              cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {incomeVsExpenseData.map((entry) => (
                <Cell
                  key={entry._id}
                  fill={entry._id === "Income" ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
