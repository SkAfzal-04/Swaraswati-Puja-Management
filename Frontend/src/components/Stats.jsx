import { motion } from "framer-motion"

export default function Stats() {
  const stats = [
    { label: "Members", value: "120+" },
    { label: "Total Donation", value: "₹2.5L+" },
    { label: "Paras Covered", value: "15+" }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="bg-orange-50 p-10 rounded-2xl shadow-lg"
          >
            <h4 className="text-4xl font-extrabold text-orange-600">
              {s.value}
            </h4>
            <p className="mt-2 text-gray-600">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
