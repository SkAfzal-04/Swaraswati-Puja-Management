import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function QuickLinks() {
  const cards = [
    {
      title: "Member Management",
      icon: "👥",
      path: "/members",
      color: "from-yellow-400 to-orange-400"
    },
    {
      title: "Budget & Finance",
      icon: "💰",
      path: "/budget",
      color: "from-orange-400 to-red-400"
    }
  ]

  return (
    <section className="py-20 bg-orange-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        {cards.map((card, i) => (
          <Link key={i} to={card.path}>
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${card.color} p-10 rounded-2xl shadow-xl text-white cursor-pointer`}
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h4 className="text-2xl font-bold">{card.title}</h4>
              <p className="mt-2 opacity-90">Click to manage</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  )
}
