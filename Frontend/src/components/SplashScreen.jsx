import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [startExit, setStartExit] = useState(false);

  useEffect(() => {
    // Start exit animation after 3.5 seconds
    const timer = setTimeout(() => setStartExit(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex justify-center items-center bg-white z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: startExit ? 0 : 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      onAnimationComplete={() => startExit && onFinish()}
    >
      <motion.img
        src="/logo.png"
        alt="Swaraswati Puja Logo"
        className="rounded-full object-cover shadow-[0_0_20px_rgba(255,165,0,0.7)]"
        initial={{
          scale: 3,
          y: 0,
          boxShadow: "0 0 30px rgba(255,165,0,0.7)"
        }}
        animate={{
          scale: startExit ? 1.5 : 3, // shrink to navbar size
          y: startExit ? -90 : 0, // move up toward navbar
          boxShadow: [
            "0 0 20px rgba(255,165,0,0.7)",
            "0 0 35px rgba(255,200,0,0.9)",
            "0 0 20px rgba(255,165,0,0.7)"
          ] // glowing pulse effect
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut"
        }}
        style={{
          width: window.innerWidth < 768 ? 120 : 150, // bigger on laptop
          height: window.innerWidth < 768 ? 120 : 150
        }}
      />
    </motion.div>
  );
}
