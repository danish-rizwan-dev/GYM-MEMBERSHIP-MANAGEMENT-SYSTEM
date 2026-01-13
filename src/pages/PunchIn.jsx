import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, Zap, User, Loader2 } from "lucide-react";

export default function PunchIn() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successId, setSuccessId] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (search.length < 2) {
      setMembers([]);
      return;
    }
    fetchMembers();
  }, [search]);

  async function fetchMembers() {
    const { data } = await supabase
      .from("members")
      .select("id, full_name, phone")
      .or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
      .limit(6);

    setMembers(data || []);
  }

  async function punchIn(memberId) {
    setLoading(true);
    setSuccessId(null);
    // ✅ Check if already logged today
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("member_id", memberId)
      .eq("checkin_date", today)
      .maybeSingle();

    if (existing) {
      alert("⚠️ Already logged for today.");
      setLoading(false);
      return;
    }

    // ✅ Mark attendance
    const { error } = await supabase.from("attendance").insert([
      {
        member_id: memberId,
        checkin_date: today,
      },
    ]);

    if (!error) {
      setSuccessId(memberId);
      // Clear search after 1.5s to reset the screen
      setTimeout(() => {
        setSearch("");
        setSuccessId(null);
      }, 1500);
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20 space-y-10">
        {/* HEADER */}
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <Zap size={12} fill="currentColor" /> Rapid Entry
          </div>
          <h2 className="text-5xl font-black text-slate-950 italic uppercase tracking-tighter">
            Punch <span className="text-indigo-600">In</span>
          </h2>
          <p className="text-slate-500 font-medium">Verify identity to log daily session</p>
        </header>

        {/* SEARCH BOX */}
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            className="w-full bg-white border border-slate-200 rounded-[2rem] pl-14 p-6 text-lg font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            placeholder="Athlete Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* RESULTS AREA */}
        <div className="space-y-4">
          <AnimatePresence>
            {members.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex justify-between items-center p-5 rounded-3xl border transition-all ${
                  successId === m.id 
                  ? "bg-emerald-50 border-emerald-200" 
                  : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    successId === m.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase tracking-tight">{m.full_name}</p>
                    <p className="text-xs text-slate-400 font-bold">{m.phone}</p>
                  </div>
                </div>

                <button
                  onClick={() => punchIn(m.id)}
                  disabled={loading || successId === m.id}
                  className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    successId === m.id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-950 text-white hover:bg-indigo-600 active:scale-95 disabled:opacity-50"
                  }`}
                >
                  {loading && !successId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : successId === m.id ? (
                    <>
                      <CheckCircle size={16} /> Logged
                    </>
                  ) : (
                    "Confirm Entry"
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {search.length >= 2 && members.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">Athlete identity not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}