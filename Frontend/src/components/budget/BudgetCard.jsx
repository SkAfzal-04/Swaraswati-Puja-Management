import { motion } from "framer-motion"

export default function BudgetCards({ summary = {}, loading = false }) {
  const {
    totalCollection = 0,
    totalMemberContribution = 0,
    dueAmount = 0,
    expectedCollection = 0,
    totalExpense = 0,
    TotalChandaExceptMembers = 0
  } = summary

  const cards = [
    { label: "Total Collection", value: totalCollection, bg: "bg-green-50", text: "text-green-700" },
    { label: "Member Contribution", value: totalMemberContribution, bg: "bg-purple-50", text: "text-purple-700" },
    { label: "Collection Except Members", value: TotalChandaExceptMembers, bg: "bg-teal-50", text: "text-teal-700" },
    { label: "Due Amount", value: dueAmount, bg: "bg-yellow-50", text: "text-yellow-700" },
    { label: "Expected Collection", value: expectedCollection, bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Total Expense", value: totalExpense, bg: "bg-red-50", text: "text-red-700" }
  ]

  // Skeleton placeholder
  const SkeletonCard = ({ i }) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      className="p-6 rounded-xl shadow-sm bg-gray-100 animate-pulse"
    >
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-300 rounded w-1/2 mt-1"></div>
    </motion.div>
  )

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
      {loading
        ? Array(cards.length)
            .fill(0)
            .map((_, i) => <SkeletonCard key={i} i={i} />)
        : cards.map((card, i) => (
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
