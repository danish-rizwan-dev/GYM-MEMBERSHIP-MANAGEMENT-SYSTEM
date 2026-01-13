import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Phone, CheckCircle, ChevronLeft, 
  Zap, Activity, Calendar, IndianRupee, ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ActiveMembers() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveMembers();
  }, []);

  async function fetchActiveMembers() {
    setLoading(true);
    const today = new Date().toLocaleDateString('en-CA'); 

    // Fetch members and their memberships
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
      // Logic: Only include members who have AT LEAST one future end_date
      const activeList = data.filter(m => {
        if (!m.memberships || m.memberships.length === 0) return false;
        return m.memberships.some(membership => membership.end_date >= today);
      }).map(m => {
        // Find the furthest end_date to display
        const latestPlan = m.memberships
          .filter(ms => ms.end_date >= today)
          .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))[0];
        
        return {
          id: m.id,
          full_name: m.full_name,
          phone: m.phone,
          end_date: latestPlan.end_date,
          plan: latestPlan.plan
        };
      });

      setMembers(activeList);
    }
    setLoading(false);
  }

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

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
            <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em]">
              <CheckCircle size={10} fill="currentColor" /> Access Authorized
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
              Active <span className="text-emerald-500">Athletes</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
              {filtered.length} Live Nodes Currently Authorized
            </p>
          </div>

          <button
            onClick={() => navigate("/members")}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95"
          >
            <Zap size={14} /> Full Directory
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            className="w-full bg-white border border-slate-200 p-4 pl-14 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-bold text-sm transition-all shadow-sm"
            placeholder="Search active athletes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST SECTION */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Activity className="text-emerald-500 animate-pulse" size={40} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Syncing Authorized Data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
            <Zap className="w-10 h-10 mx-auto mb-3 text-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No Active Plans Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/members/${m.id}`)}
                className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-emerald-400 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center text-lg font-black italic group-hover:bg-emerald-600 transition-colors">
                    {m.full_name.charAt(0)}
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[8px] font-black uppercase tracking-widest">
                    Authorized
                  </div>
                </div>

                <div className="space-y-1 mb-6 relative z-10">
                  <h4 className="text-xl font-black text-slate-950 group-hover:text-emerald-600 transition-colors uppercase italic truncate">
                    {m.full_name}
                  </h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                    <Phone size={10} /> {m.phone}
                  </div>
                </div>

                <div className="space-y-3 border-t border-slate-50 pt-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valid Until</span>
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                      <Calendar size={12} /> {m.end_date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plan Type</span>
                    <span className="text-[10px] font-bold text-slate-900 uppercase">
                      {m.plan}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">View Profile</span>
                  <ArrowUpRight size={14} className="text-emerald-600" />
                </div>
                
                <CheckCircle size={150} className="absolute bottom-[-40px] right-[-40px] text-slate-50 opacity-10 pointer-events-none group-hover:text-emerald-50 transition-colors" />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}