import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle, Zap, User, Loader2, 
  AlertCircle, Fingerprint
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function PunchIn() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [status, setStatus] = useState({ id: null, type: "" });

  // Use local date to avoid timezone bugs
  const getToday = () => new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    if (search.length < 2) {
      setMembers([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => fetchMembers(), 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  async function fetchMembers() {
    const { data } = await supabase
      .from("members")
      .select("id, full_name, phone")
      .or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
      .limit(5);
    setMembers(data || []);
  }

  async function punchIn(memberId) {
    const today = getToday();
    setLoadingId(memberId);
    
    // 1. Check if already logged
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("member_id", memberId)
      .eq("checkin_date", today)
      .maybeSingle();

    if (existing) {
      setStatus({ id: memberId, type: "exists" });
      setLoadingId(null);
      setTimeout(() => setStatus({ id: null, type: "" }), 2000);
      return;
    }

    // 2. Mark attendance
    const { error } = await supabase.from("attendance").insert([
      { member_id: memberId, checkin_date: today }
    ]);

    if (!error) {
      setStatus({ id: memberId, type: "success" });
      setTimeout(() => {
        setSearch("");
        setStatus({ id: null, type: "" });
      }, 1500);
    }
    setLoadingId(null);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 pt-40 pb-20 space-y-8">
        
        {/* COMPACT TERMINAL HEADER */}
        <header className="border-b border-slate-100 pb-6 text-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic leading-none mb-2">Attendance Terminal</h3>
          <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">
            Session <span className="text-indigo-600">Logger</span>
          </h2>
        </header>

        {/* SEARCH BOX */}
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
            <Fingerprint size={20} className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 p-5 text-base font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            placeholder="Scan Name or Contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* ATTENDANCE RESULTS */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {members.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  status.id === m.id && status.type === 'success' ? "bg-emerald-50 border-emerald-200" :
                  status.id === m.id && status.type === 'exists' ? "bg-amber-50 border-amber-200" :
                  "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    status.id === m.id && status.type === 'success' ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-400"
                  }`}>
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase italic tracking-tight text-sm leading-none mb-1">{m.full_name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{m.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => punchIn(m.id)}
                  disabled={loadingId === m.id}
                  className={`h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center gap-2 ${
                    status.id === m.id && status.type === 'success' ? "bg-emerald-500 text-white" :
                    status.id === m.id && status.type === 'exists' ? "bg-amber-500 text-white shadow-lg" :
                    "bg-slate-950 text-white hover:bg-indigo-600 active:scale-95"
                  }`}
                >
                  {loadingId === m.id ? <Loader2 size={14} className="animate-spin" /> : 
                   status.id === m.id && status.type === 'success' ? <><CheckCircle size={14} /> OK</> :
                   status.id === m.id && status.type === 'exists' ? "ALREADY LOGGED" : 
                   "MARK ENTRY"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}