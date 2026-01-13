import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Phone, MessageSquare, ChevronLeft, 
  Zap, AlertCircle, Calendar, IndianRupee, Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ExpiredMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpired();
  }, []);

  async function fetchExpired() {
  setLoading(true);
  const today = new Date().toLocaleDateString('en-CA'); 

  // 1. Fetch all members along with their memberships
  const { data, error } = await supabase
    .from("members")
    .select(`
      id, 
      full_name, 
      phone,
      memberships (
        end_date,
        plan
      )
    `);

  if (!error && data) {
    // 2. Filter the data on the frontend
    const expiredList = data.filter(m => {
      // If they have no memberships at all, skip or include as you prefer
      if (!m.memberships || m.memberships.length === 0) return false;

      // Find the LATEST end_date among all their memberships
      const latestExpiry = m.memberships.reduce((latest, current) => {
        return (new Date(current.end_date) > new Date(latest)) ? current.end_date : latest;
      }, m.memberships[0].end_date);

      // Only include them if their LATEST membership is in the past
      return latestExpiry < today;
    }).map(m => {
        // Find the specific plan details for the latest membership to show in the list
        const latestPlan = m.memberships.sort((a,b) => new Date(b.end_date) - new Date(a.end_date))[0];
        return {
            members: { id: m.id, full_name: m.full_name, phone: m.phone },
            end_date: latestPlan.end_date,
            plan: latestPlan.plan
        };
    });

    setMembers(expiredList);
  }
  setLoading(false);
}

  const filtered = members.filter(
    (m) =>
      m.members.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.members.phone.includes(search)
  );

  function getAmount(plan) {
    const plans = { MONTHLY: 1500, QUARTERLY: 4000, YEARLY: 14000 };
    return plans[plan] || 1500;
  }

  function sendAllRenewals() {
    filtered.forEach((m, index) => {
      const amount = getAmount(m.plan);
      const message = encodeURIComponent(
        `⚠️ MEMBERSHIP EXPIRED – HEALTH ADDICTION GYM\n\nHello ${m.members.full_name},\n\nYour gym membership has expired.\n\n💳 Renewal Details:\nPlan: ${m.plan}\nAmount: ₹${amount}\n\n📌 Pay using UPI QR:\nhttp://localhost:5173/upi-qr.png\n\nAfter payment, please show the receipt at the gym 💪\n\n– HEALTH ADDICTION GYM`
      );

      setTimeout(() => {
        window.open(`https://wa.me/${m.members.phone}?text=${message}`, "_blank");
      }, index * 1000); // 1-second delay to prevent browser blocks
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      <Navbar />

      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-32 pb-20 space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-500 font-black text-[9px] uppercase tracking-[0.3em]">
              <AlertCircle size={10} fill="currentColor" /> Access Terminated
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
              Expired <span className="text-rose-500">Athletes</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              {filtered.length} Terminated Identifiers Found
            </p>
          </div>

          <button
            onClick={sendAllRenewals}
            disabled={filtered.length === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <Send size={14} /> Send All Alerts ({filtered.length})
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
          <input
            className="w-full bg-white border border-slate-200 p-4 pl-14 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 text-slate-900 placeholder:text-slate-400 font-bold text-sm transition-all shadow-sm"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST SECTION */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Zap className="text-rose-500 animate-pulse" size={40} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Scanning Registry...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
            <Zap className="w-10 h-10 mx-auto mb-3 text-emerald-500 opacity-20" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Registry is Clean. No Expired Members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/members/${m.members.id}`)}
                className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-rose-400 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center text-lg font-black italic group-hover:bg-rose-600 transition-colors">
                    {m.members.full_name.charAt(0)}
                  </div>
                  <div className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    Expired
                  </div>
                </div>

                <div className="space-y-1 mb-6 relative z-10">
                  <h4 className="text-xl font-black text-slate-950 group-hover:text-rose-600 transition-colors uppercase italic truncate">
                    {m.members.full_name}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <Phone size={10} /> {m.members.phone}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-50 pt-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</span>
                    <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                      <Calendar size={12} /> {m.end_date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Renewal</span>
                    <span className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                      <IndianRupee size={12} /> {getAmount(m.plan)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 relative z-10">
                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={`https://wa.me/${m.members.phone}?text=${encodeURIComponent(`⚠️ MEMBERSHIP EXPIRED – HEALTH ADDICTION GYM\n\nHello ${m.members.full_name},\n\nYour gym membership has expired.\n\n💳 Renewal Details:\nPlan: ${m.plan}\nAmount: ₹${getAmount(m.plan)}\n\n📌 Pay using UPI QR:\nhttp://localhost:5173/upi-qr.png\n\nAfter payment, please show the receipt at the gym 💪\n\n– HEALTH ADDICTION GYM`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95"
                  >
                    <MessageSquare size={14} /> Send Alert
                  </a>
                </div>
                
                <AlertCircle size={150} className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-10 pointer-events-none group-hover:text-rose-50 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}