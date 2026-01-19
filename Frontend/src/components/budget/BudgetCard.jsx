import { motion } from "framer-motion"

export default function BudgetCards({ summary }) {
  // Map each card to a Tailwind-compatible color class
  const cards = [
    {
      label: "Total Collection",
      value: summary.totalIncome,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Total Expense",
      value: summary.totalExpense,
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      label: "Remaining Balance",
      value: summary.balance,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  ]

  return (
    <div className="flex flex-wrap justify-between gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex-1 min-w-[150px] p-4 md:p-6 rounded-xl shadow ${card.bg}`}
        >
          <p className={`text-sm font-medium ${card.text}`}>{card.label}</p>
          <h2 className="text-xl md:text-2xl font-bold mt-1">₹ {card.value}</h2>
        </motion.div>
      ))}
    </div>
  )
}
