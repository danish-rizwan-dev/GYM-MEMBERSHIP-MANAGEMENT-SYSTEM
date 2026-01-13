import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import PaymentHistory from "../components/PaymentHistory";
import AttendanceHistory from "../components/AttendanceHistory";
import EditMembership from "../components/EditMembership";
import { 
  Phone, Calendar, X, Edit2, ShieldAlert, Zap, 
  MessageSquare, ChevronLeft, User
} from "lucide-react"; 

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [memberships, setMemberships] = useState([]); // Changed to plural
  const [loading, setLoading] = useState(true);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => { fetchMember(); }, [id]);

  async function fetchMember() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data: mData } = await supabase.from("members").select("*").eq("id", id).single();
      
      // FETCH ALL MEMBERSHIPS THAT END IN THE FUTURE
      const { data: memData } = await supabase
        .from("memberships")
        .select("*")
        .eq("member_id", id)
        .gte("end_date", today) // Only get memberships that haven't expired
        .order("start_date", { ascending: true });

      setMember(mData);
      setMemberships(memData || []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  }

  // --- CUMULATIVE DAY CALCULATION ---
  const calculateTotalDays = () => {
    if (!memberships.length) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalDays = 0;

    memberships.forEach(m => {
      const start = new Date(m.start_date);
      const end = new Date(m.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      // If the membership has already started or starts today
      const effectiveStart = start < today ? today : start;
      
      if (end > effectiveStart) {
        const diff = Math.round((end - effectiveStart) / (1000 * 60 * 60 * 24));
        totalDays += diff;
      }
    });

    return totalDays;
  };

  const daysLeft = calculateTotalDays();
  const isExpired = daysLeft <= 0;

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="text-indigo-600 animate-pulse" /></div>;
  if (!member) return <div className="pt-40 text-center font-black text-rose-500 uppercase">Athlete Not Found</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-32 pb-20 space-y-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all">
            <ChevronLeft size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <button onClick={() => setIsEditingProfile(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase shadow-sm">
            Edit Bio
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* BIO CARD */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center shadow-sm">
            <div className="w-20 h-20 bg-slate-950 text-white rounded-[1.8rem] flex items-center justify-center text-3xl font-black italic shadow-xl mb-6">{member.full_name.charAt(0)}</div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">{member.full_name}</h2>
            <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
               <DetailLine icon={<Phone size={14}/>} label="Phone" value={member.phone} />
               <DetailLine icon={<User size={14}/>} label="Info" value={`${member.age || 'NA'}Y • ${member.gender}`} />
            </div>
          </div>

          {/* CUMULATIVE STATUS PANEL */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden flex flex-col justify-between group">
            <div className={`px-5 py-2 rounded-full w-fit text-[9px] font-black uppercase tracking-widest border ${isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
              {isExpired ? "Access Terminated" : "Total Authorized Access"}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 relative z-10">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Cumulative Days Left</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-7xl md:text-9xl font-black italic tracking-tighter ${isExpired ? 'text-rose-600' : 'text-slate-950'}`}>{daysLeft}</span>
                    <span className="text-2xl font-black uppercase italic text-indigo-600">Days</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Combined from {memberships.length} active plans</p>
               </div>
               <div className="flex flex-col gap-3 justify-center">
                  <button onClick={() => setIsRenewing(!isRenewing)} className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-600 transition-all active:scale-95">
                    {isRenewing ? "Close" : "Renew / Add Plan"}
                  </button>
               </div>
            </div>
            <Zap size={220} className="absolute bottom-[-60px] right-[-60px] text-slate-50 opacity-10 pointer-events-none" />
          </div>
        </div>

        {isRenewing && (
          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8">
            <EditMembership memberId={member.id} onSuccess={() => { setIsRenewing(false); fetchMember(); }} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><PaymentHistory memberId={member.id} /></div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><AttendanceHistory memberId={member.id} /></div>
        </div>
      </main>
    </div>
  );
}

function DetailLine({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-950">{value}</span>
    </div>
  );
}