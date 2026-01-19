import { motion } from "framer-motion"

export default function BudgetCards({ summary }) {
  const cards = [
    { label: "Total Collection", value: summary.totalIncome, color: "green" },
    { label: "Total Expense", value: summary.totalExpense, color: "red" },
    { label: "Remaining Balance", value: summary.balance, color: "blue" }
  ]

  return (
    <div className="flex flex-wrap justify-between gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 min-w-[120px] p-4 md:p-6 rounded-xl shadow bg-${card.color}-50`}
        >
          <p className="text-sm text-gray-600">{card.label}</p>
          <h2 className="text-xl md:text-2xl font-bold">₹ {card.value}</h2>
        </motion.div>
      ))}
    </div>
  )
}
