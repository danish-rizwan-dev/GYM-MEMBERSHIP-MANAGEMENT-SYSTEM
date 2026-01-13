import { motion } from "framer-motion";

export default function RevenueCard({ title, value, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={onClick}
      className="cursor-pointer bg-white/70 p-6 rounded-3xl border shadow-xl hover:border-cyan-500 transition"
    >
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
        {title}
      </p>
      <h4 className="text-4xl font-black text-slate-900 mt-2">
        ₹{value}
      </h4>
    </motion.div>
  );
}

            