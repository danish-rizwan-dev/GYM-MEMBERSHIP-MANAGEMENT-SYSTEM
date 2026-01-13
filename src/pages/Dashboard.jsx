import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, UserX, Activity, CalendarClock,
  TrendingUp, Zap, ArrowUpRight, ShieldCheck, IndianRupee,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    members: 0, active: 0, expired: 0, todayAttendance: 0,
    todayRevenue: 0, monthRevenue: 0, lifetimeRevenue: 0,
  });
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [showRevenue, setShowRevenue] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    // Use local string for strict date comparison
    const todayStr = new Date().toLocaleDateString('en-CA');
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      membersCount,
      allMemberships,
      attendanceCount,
      todayPayments,
      monthPayments,
      lifetimePayments,
    ] = await Promise.all([
      supabase.from("members").select("id", { count: "exact" }),
      supabase.from("memberships").select("member_id, end_date, members(full_name, phone)"),
      supabase.from("attendance").select("id", { count: "exact", head: true }).eq("checkin_date", todayStr),
      supabase.from("payments").select("amount").gte("created_at", todayStr),
      supabase.from("payments").select("amount").gte("created_at", startOfMonth),
      supabase.from("payments").select("amount"),
    ]);

    // --- LOGIC TO SEPARATE ACTIVE VS EXPIRED ---
    // We group by member to ensure Kabir Khan isn't counted as active AND expired
    const memberStatusMap = {};
    const watchlist = [];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const watchlistLimit = sevenDaysFromNow.toLocaleDateString('en-CA');

    allMemberships.data?.forEach(m => {
      const isCurrentlyActive = m.end_date >= todayStr;

      // Update highest status for this member
      if (!memberStatusMap[m.member_id] || isCurrentlyActive) {
        memberStatusMap[m.member_id] = isCurrentlyActive;
      }

      // Add to watchlist if expiring in next 7 days but still active
      if (m.end_date >= todayStr && m.end_date <= watchlistLimit) {
        watchlist.push(m);
      }
    });

    const activeCount = Object.values(memberStatusMap).filter(val => val === true).length;
    const totalMembers = membersCount.count || 0;

    setStats({
      members: totalMembers,
      active: activeCount,
      expired: totalMembers - activeCount,
      todayAttendance: attendanceCount.count || 0,
      todayRevenue: todayPayments.data?.reduce((s, p) => s + p.amount, 0) || 0,
      monthRevenue: monthPayments.data?.reduce((s, p) => s + p.amount, 0) || 0,
      lifetimeRevenue: lifetimePayments.data?.reduce((s, p) => s + p.amount, 0) || 0,
    });

    setExpiringSoon(watchlist.slice(0, 10)); // Top 10 imminent expiries
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-indigo-100 overflow-x-hidden font-sans">
      <Navbar />

      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-4 md:px-6 max-w-6xl mx-auto space-y-8">

        {/* HEADER AREA */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.3em]">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Intelligence Node Active
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-slate-950">
              Command <span className="text-indigo-600">Center</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest italic">Operation Metrics Audit</p>
          </div>

          <button
            onClick={() => setShowRevenue(!showRevenue)}
            className="group px-6 py-3 bg-slate-950 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <span className="flex items-center gap-2">
              <Zap size={12} fill="currentColor" /> {showRevenue ? "Lock Finances" : "Unlock Revenue"}
            </span>
          </button>
        </header>

        {/* PRIMARY STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard title="Total Athletes" value={stats.members} icon={<Users size={18} />} color="indigo" onClick={() => navigate("/members")} />
          <StatCard title="Active Plan" value={stats.active} icon={<UserCheck size={18} />} color="emerald" onClick={() => navigate("/active-members")} />
          <StatCard title="Terminated" value={stats.expired} icon={<UserX size={18} />} color="rose" onClick={() => navigate("/expired-members")} />
          <StatCard title="Attendance" value={stats.todayAttendance} icon={<Activity size={18} />} color="cyan" onClick={() => navigate("/attendance")} />
        </div>

        {/* REVENUE SECTION */}
        <AnimatePresence>
          {showRevenue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
            >
              <RevenueCard title="Daily Intake" value={stats.todayRevenue} />
              <RevenueCard title="Month to Date" value={stats.monthRevenue} />
              <RevenueCard title="Net Lifetime" value={stats.lifetimeRevenue} isHighlighted />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* WATCHLIST */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black italic uppercase tracking-widest text-[10px] flex items-center gap-2 text-slate-400">
                <CalendarClock className="text-orange-500" size={14} /> Expiry Watchlist
              </h3>
              <span className="text-[8px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">Next 7 Days</span>
            </div>

            {expiringSoon.length === 0 ? (
              <div className="py-16 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                <ShieldCheck size={28} className="mx-auto mb-3 text-emerald-500 opacity-30" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">All Clear — No Imminent Expiry</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiringSoon.map((m, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 5, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    // This onClick now correctly routes to the specific member's profile
                    onClick={() => navigate(`/members/${m.member_id}`)}
                    className="flex justify-between items-center bg-white border border-slate-100 p-5 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {/* Small Avatar Initial */}
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center font-black italic transition-colors">
                        {m.members?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase text-slate-900 group-hover:text-indigo-600 leading-none transition-colors">
                          {m.members?.full_name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1.5 tracking-widest uppercase">
                          {m.members?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-rose-600 font-mono text-[11px] font-black bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 italic">
                        {m.end_date}
                      </p>
                      <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-1">
                        Expiry Date
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RETENTION METER */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex flex-col justify-between group overflow-hidden relative">
            <div>
              <TrendingUp className="text-indigo-600 mb-6" size={24} />
              <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Retention<br />Health</h3>
              <p className="text-slate-400 text-[10px] mt-3 font-black uppercase tracking-widest">Active Ratio Sync</p>
            </div>

            <div className="mt-10 space-y-6 relative z-10">
              <div className="flex justify-between items-end">
                <span className="text-7xl font-black italic text-slate-950 tracking-tighter leading-none">
                  {stats.members ? Math.round((stats.active / stats.members) * 100) : 0}%
                </span>
                <ArrowUpRight size={24} className="opacity-20 mb-2" />
              </div>
              <div className="h-4 bg-slate-50 rounded-full p-1 border border-slate-100 shadow-inner overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.members ? (stats.active / stats.members) * 100 : 0}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-lg"
                />
              </div>
            </div>
            <Zap size={160} className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-10 pointer-events-none group-hover:text-indigo-50 transition-colors" />
          </div>

        </div>

        <footer className="pt-10 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">HA-OS v3.1 Terminal Output</p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.1s]" />
            <div className="w-2 h-2 rounded-full bg-indigo-200 animate-bounce [animation-delay:-0.2s]" />
          </div>
        </footer>
      </main>
    </div>
  );
}

// HELPER COMPONENTS

function StatCard({ title, value, icon, color, onClick }) {
  const iconColors = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] border border-slate-200 cursor-pointer transition-all bg-white shadow-sm hover:border-indigo-400 group relative overflow-hidden`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all border ${iconColors[color]} group-hover:scale-110 shadow-sm`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-2 text-slate-400 italic leading-none">{title}</p>
      <h4 className="text-5xl font-black italic tracking-tighter leading-none text-slate-900">{value}</h4>
      <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
        {icon}
      </div>
    </motion.div>
  );
}

function RevenueCard({ title, value, isHighlighted }) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all ${isHighlighted
        ? 'bg-slate-950 text-white border-slate-950 shadow-2xl'
        : 'bg-white hover:border-indigo-600 border-slate-100 shadow-sm'
      }`}>
      <p className={`text-[10px] uppercase font-black tracking-widest italic mb-3 ${isHighlighted ? 'text-indigo-400' : 'text-slate-400'}`}>
        {title}
      </p>
      <h4 className="text-4xl font-black flex items-baseline gap-1 tracking-tighter italic">
        <span className="text-sm opacity-50 font-sans not-italic">₹</span>
        {value.toLocaleString()}
      </h4>
    </div>
  );
}