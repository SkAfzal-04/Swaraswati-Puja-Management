import { motion } from "framer-motion"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-200 py-24 px-6">

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-10 left-10 w-40 h-40 bg-orange-300 opacity-30 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute bottom-10 right-10 w-52 h-52 bg-yellow-300 opacity-30 rounded-full"
      />

      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-orange-700"
        >
          🙏 Saraswati Puja Management
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-lg text-gray-700"
        >
          Knowledge • Devotion • Transparency • Community
        </motion.p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {["idol", "festival", "temple"].map((img, i) => (
            <motion.img
              key={i}
              src={`https://source.unsplash.com/400x300/?${img}`}
              whileHover={{ scale: 1.08 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="rounded-2xl shadow-xl"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
