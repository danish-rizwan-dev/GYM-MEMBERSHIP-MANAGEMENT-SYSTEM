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

      {/* Increased max-width and vertical padding */}
      <main className="max-w-2xl mx-auto px-6 pt-44 pb-20 space-y-10">
        
        {/* BIGGER HEADER */}
        <header className="border-b-2 border-slate-100 pb-8 text-center">
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 italic leading-none mb-3">Attendance Terminal</h3>
          <h2 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">
            Session <span className="text-indigo-600">Logger</span>
          </h2>
        </header>

        {/* BIGGER SEARCH BOX */}
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
            <Fingerprint size={28} className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] pl-16 p-7 text-xl font-bold outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300"
            placeholder="Search Athlete Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* BIGGER RESULTS CARDS */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {members.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between transition-all ${
                  status.id === m.id && status.type === 'success' ? "bg-emerald-50 border-emerald-200" :
                  status.id === m.id && status.type === 'exists' ? "bg-amber-50 border-amber-200" :
                  "bg-white border-slate-100 shadow-md hover:shadow-xl hover:border-indigo-400"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${
                    status.id === m.id && status.type === 'success' ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    <User size={28} />
                  </div>
                  <div>
                    <p className="font-black text-slate-950 uppercase italic tracking-tight text-xl leading-none mb-2">{m.full_name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{m.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => punchIn(m.id)}
                  disabled={loadingId === m.id}
                  className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 shadow-lg active:scale-90 ${
                    status.id === m.id && status.type === 'success' ? "bg-emerald-500 text-white" :
                    status.id === m.id && status.type === 'exists' ? "bg-amber-500 text-white" :
                    "bg-slate-950 text-white hover:bg-indigo-600"
                  }`}
                >
                  {loadingId === m.id ? <Loader2 size={18} className="animate-spin" /> : 
                   status.id === m.id && status.type === 'success' ? <><CheckCircle size={18} /> OK</> :
                   status.id === m.id && status.type === 'exists' ? "LOGGED" : 
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