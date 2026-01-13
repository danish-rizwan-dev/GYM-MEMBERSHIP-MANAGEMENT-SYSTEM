import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Phone, ArrowRight, Loader2,
  User, Calendar, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AddMemberForm from "../components/AddMemberForm";

export default function Members() {
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function fetchMembers() {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select(`
        *,
        memberships (
          start_date,
          end_date
        )
      `);

    setMembers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden">
      <Navbar />

      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-32 pb-20 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[9px] uppercase tracking-[0.3em]">
              <Zap size={10} fill="currentColor" /> Registry Access
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
              Athlete <span className="text-indigo-600">Directory</span>
            </h2>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-950 hover:bg-indigo-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95"
          >
            <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
            {showForm ? "Close Terminal" : "Register New Athlete"}
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full bg-white border border-slate-200 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-bold text-sm transition-all"
            placeholder="Search Bio-Name or Contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px]">Decrypting Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((m) => {
              
              // --- CUMULATIVE ACTIVE DAYS LOGIC ---
              const calculateActiveStatus = () => {
                if (!m.memberships || m.memberships.length === 0) return { expired: true, days: 0 };
                
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                let totalDays = 0;

                m.memberships.forEach(membership => {
                  const [sYear, sMonth, sDay] = membership.start_date.split('-').map(Number);
                  const [eYear, eMonth, eDay] = membership.end_date.split('-').map(Number);
                  
                  const start = new Date(sYear, sMonth - 1, sDay);
                  const end = new Date(eYear, eMonth - 1, eDay);

                  // Only process if the plan hasn't fully passed yet
                  if (end >= today) {
                    const effectiveStart = start < today ? today : start;
                    const diff = Math.round((end - effectiveStart) / (1000 * 60 * 60 * 24));
                    totalDays += (diff >= 0 ? diff + 1 : 0);
                  }
                });

                return { expired: totalDays <= 0, days: totalDays };
              };

              const status = calculateActiveStatus();

              return (
                <motion.div
                  key={m.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/members/${m.id}`)}
                  className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-600 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center text-lg font-black italic group-hover:bg-indigo-600 transition-colors">
                      {m.full_name?.charAt(0)}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${
                        status.expired
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}
                    >
                      {status.expired ? "Terminated" : `${status.days} Days Left`}
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h4 className="text-xl font-black text-slate-950 group-hover:text-indigo-600 transition-colors uppercase italic truncate">
                      {m.full_name}
                    </h4>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                      Node: {m.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="space-y-3 border-t border-slate-50 pt-5">
                    <div className="flex items-center gap-3">
                      <Phone size={12} className="text-slate-400" />
                      <span className="text-xs font-bold font-mono text-slate-600">{m.phone}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-[8px] font-black uppercase tracking-widest text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                      Access Profile
                    </p>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}   