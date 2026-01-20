import { motion } from "framer-motion";

// Images array
const heroImages = [
  "/images/image1.jpeg",
  "/images/image2.jpeg",
  "/images/image3.jpeg",
  "/images/image4.jpeg",
];

// YouTube link
const YOUTUBE_LINK =
  "https://www.youtube.com/watch?si=L31z_C6G_Qt_0rSu&v=4dHfI0SqWMk&feature=youtu.be";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-200 via-orange-200 to-pink-200 py-24 px-6">
      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute top-10 left-10 w-40 h-40 bg-pink-300 opacity-40 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute bottom-10 right-10 w-52 h-52 bg-yellow-300 opacity-40 rounded-full"
      />

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-orange-700"
        >
          Panchra Agragami Sangha
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 md:mt-6 text-lg md:text-xl text-gray-700"
        >
          Knowledge • Devotion • Transparency • Community
        </motion.p>

        {/* ================= IMAGES GRID ================= */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroImages.map((img, i) => (
            <motion.div
              key={i}
              className="relative w-full h-64 rounded-3xl overflow-hidden cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              {/* Glowing Border */}
              <div className="absolute inset-0 rounded-3xl p-[3px] bg-gradient-to-r from-pink-400 via-yellow-300 to-orange-400 animate-glow">
                <div className="w-full h-full rounded-3xl bg-white overflow-hidden">
                  <img
                    src={img}
                    alt={`Hero ${i + 1}`}
                    className="w-full h-full object-cover rounded-3xl transition-transform duration-300"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ================= YOUTUBE VIDEO ================= */}
        <div className="mt-12 flex justify-center">
          <a
            href={YOUTUBE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full max-w-2xl h-64 group rounded-3xl cursor-pointer overflow-hidden"
          >
            {/* Glowing border */}
            <div className="absolute inset-0 rounded-3xl p-[3px] bg-gradient-to-r from-pink-400 via-yellow-300 to-orange-400 animate-glow">
              <div className="w-full h-full rounded-3xl overflow-hidden relative">
                {/* Autoplay muted iframe */}
                <iframe
                  src="https://www.youtube.com/embed/4dHfI0SqWMk?autoplay=1&mute=1&loop=1&playlist=4dHfI0SqWMk&controls=0"
                  title="YouTube video"
                  className="w-full h-full rounded-3xl"
                  allow="autoplay; encrypted-media"
                ></iframe>

                {/* Play Overlay (only on video) */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
