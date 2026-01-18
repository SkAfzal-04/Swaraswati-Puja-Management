import { motion } from "framer-motion"

const events = [
  { date: "10 Feb", title: "Puja Sthapana", icon: "🛕" },
  { date: "11 Feb", title: "Cultural Night", icon: "🎶" },
  { date: "12 Feb", title: "Celebrity Visit", icon: "🌟" },
]

export default function EventHighlights() {
  return (
    <section className="py-20 bg-white">
      <h3 className="text-3xl font-bold text-center text-orange-600 mb-12">
        📅 Puja Highlights
      </h3>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {events.map((e, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-8 rounded-2xl shadow-xl"
          >
            <div className="text-4xl mb-4">{e.icon}</div>
            <h4 className="text-xl font-bold">{e.title}</h4>
            <p className="mt-2">{e.date}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
