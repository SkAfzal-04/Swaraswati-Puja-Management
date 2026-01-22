import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchStats } from "../services/memberService";

export default function Stats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchStats();

        setStats([
          { label: "Members", value: `${data.members}+` },
          { label: "Total Collection", value: `₹${formatAmount(data.totalCollection)}+` },
          { label: "Total Expense", value: `₹${formatAmount(data.totalExpense)}+` },
        ]);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-orange-50 p-10 rounded-2xl shadow-lg animate-pulse"
              >
                {/* Value skeleton */}
                <div className="h-10 w-32 mx-auto bg-orange-200 rounded mb-4"></div>

                {/* Label skeleton */}
                <div className="h-4 w-24 mx-auto bg-gray-300 rounded"></div>
              </div>
            ))
          : stats.map((s, i) => (
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
  );
}

// ---------- Helper ----------
function formatAmount(amount) {
  if (!amount) return "0";
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
}
