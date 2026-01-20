import { motion } from "framer-motion"

export default function BudgetCards({ summary = {} }) {
  const {
    totalCollection = 0,          // Paid via transactions + member contributions
    totalMemberContribution = 0,  // Member contributions only
    dueAmount = 0,                 // Due amount
    expectedCollection = 0,        // Total including due
    totalExpense = 0,              // Expenses
    remainingBalance = 0           // Cash in hand minus expenses
  } = summary

  const cards = [
    {
      label: "Total Collection",
      value: totalCollection,
      bg: "bg-green-50",
      text: "text-green-700"
    },
    {
      label: "Member Contribution",
      value: totalMemberContribution,
      bg: "bg-purple-50",
      text: "text-purple-700"
    },
    {
      label: "Due Amount",
      value: dueAmount,
      bg: "bg-yellow-50",
      text: "text-yellow-700"
    },
    {
      label: "Expected Collection",
      value: expectedCollection,
      bg: "bg-blue-50",
      text: "text-blue-700"
    },
    {
      label: "Total Expense",
      value: totalExpense,
      bg: "bg-red-50",
      text: "text-red-700"
    },
    {
      label: "Remaining Balance",
      value: remainingBalance,
      bg: "bg-teal-50",
      text: "text-teal-700"
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`p-4 md:p-6 rounded-xl shadow-sm ${card.bg}`}
        >
          <p className={`text-sm font-medium ${card.text}`}>{card.label}</p>
          <h2 className="text-xl md:text-2xl font-bold mt-1">
            ₹ {Number(card.value).toLocaleString("en-IN")}
          </h2>
        </motion.div>
      ))}
    </div>
  )
}
