import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Brush,
} from "recharts"

import {
  getParaGraph,
  getDayGraph,
  getIncomeVsExpense,
  getTopDonors,
  getDonorByDate,
  getExpenseByDate,
} from "../../services/transactionApi"

export default function BudgetGraphs() {
  const [paraData, setParaData] = useState([])
  const [dayData, setDayData] = useState([])
  const [incomeVsExpenseData, setIncomeVsExpenseData] = useState([])
  const [topDonorsData, setTopDonorsData] = useState([])
  const [donorByDateData, setDonorByDateData] = useState([])
  const [expenseData, setExpenseData] = useState([])

  const colors = ["#4f46e5", "#f97316", "#10b981", "#e11d48", "#facc15"]

  useEffect(() => {
    fetchGraphs()
  }, [])

  const fetchGraphs = async () => {
    try {
      const [para, day, incomeVsExpense, topDonors, donorByDate, expense] =
        await Promise.all([
          getParaGraph(),
          getDayGraph(),
          getIncomeVsExpense(),
          getTopDonors(),
          getDonorByDate(),
          getExpenseByDate(),
        ])

      setParaData(para)
      setDayData(day)

      // Combine income vs expense by date for line chart
      const incomeMap = {}
      incomeVsExpense.forEach((d) => {
        incomeMap[d.date] = { date: d.date, income: d.income || 0 }
      })

      const expenseMap = {}
      expense.forEach((d) => {
        expenseMap[d.date] = { date: d.date, expense: d.total || 0 }
      })

      const allDates = Array.from(
        new Set([...incomeVsExpense.map((d) => d.date), ...expense.map((d) => d.date)])
      ).sort()

      const combinedData = allDates.map((date) => ({
        date,
        income: incomeMap[date]?.income || 0,
        expense: expenseMap[date]?.expense || 0,
      }))

      setIncomeVsExpenseData(combinedData)

      // Top donors
      setTopDonorsData(topDonors.map((d) => ({ donor: d.name, total: d.total })))

      // Donor contributions over time
      const donorMap = {}
      donorByDate.forEach((d) => {
        const date = d.date
        if (!donorMap[date]) donorMap[date] = { date }
        donorMap[date][d.name] = d.totalPaid
      })
      setDonorByDateData(Object.values(donorMap))

      // Expense by date
      setExpenseData(expense)
    } catch (err) {
      console.error("Failed to fetch graph data:", err)
    }
  }

  return (
    <div className="space-y-8">
      {/* PARA-WISE COLLECTION */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Para-wise Collection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paraData}>
            <XAxis dataKey="_id" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {paraData.map((_, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Bar>
            {paraData.length > 5 && <Brush dataKey="_id" height={30} stroke="#4b5563" />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DAY-WISE COLLECTION */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Day-wise Collection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} />
            {dayData.length > 5 && <Brush dataKey="_id" height={30} stroke="#10b981" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* INCOME VS EXPENSE BY DATE */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Income vs Expense Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={incomeVsExpenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
            {incomeVsExpenseData.length > 5 && <Brush dataKey="date" height={30} stroke="#4b5563" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TOP DONORS */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Top Donors</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topDonorsData}>
            <XAxis dataKey="donor" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Bar dataKey="total" fill="#f97316" radius={[4, 4, 0, 0]} />
            {topDonorsData.length > 5 && <Brush dataKey="donor" height={30} stroke="#f97316" />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* DONOR CONTRIBUTION OVER TIME */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Donor Contribution Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={donorByDateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Legend />
            {donorByDateData[0] &&
              Object.keys(donorByDateData[0])
                .filter((k) => k !== "date")
                .map((donor, index) => (
                  <Line
                    key={donor}
                    type="monotone"
                    dataKey={donor}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                  />
                ))}
            {donorByDateData.length > 5 && <Brush dataKey="date" height={30} stroke="#4b5563" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* EXPENSE BY DATE */}
      <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
        <h3 className="font-semibold mb-4 text-gray-700">Expense Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} />
            {expenseData.length > 5 && <Brush dataKey="date" height={30} stroke="#ef4444" />}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
