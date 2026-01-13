import { motion } from "framer-motion";
import { 
  Users, 
  LayoutDashboard, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  BarChart3, 
  QrCode, 
  History, 
  TrendingUp 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; // Using your existing component

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-indigo-100 overflow-x-hidden font-sans">
      <Navbar />

      {/* BACKGROUND ARCHITECTURE */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <main className="relative z-10 pt-28 md:pt-36 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
        
        {/* COMPACT HERO - Reduced Scale */}
        <section className="text-center mb-10 md:mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none italic uppercase text-slate-950">
              HA <span className="text-indigo-600">GYM</span>
            </h1>
            <div className="mt-1 flex flex-col md:flex-row items-center gap-1 md:gap-3">
              <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.5em] text-slate-400 italic">
                HEALTH ADDICTION GYM
              </span>
              <div className="hidden md:block w-6 h-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600">Secure Node Active</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* COMPACT BENTO GRID - Adjusted rows and gap */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 auto-rows-auto md:auto-rows-[160px]">
          
          {/* DASHBOARD CARD - Slimmer & Tighter */}
          <motion.div 
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)" }} 
            onClick={() => navigate("/dashboard")}
            className="md:col-span-8 md:row-span-2 group bg-white border border-slate-200 p-6 md:p-8 rounded-[1.8rem] cursor-pointer relative overflow-hidden transition-all"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:bg-indigo-600 transition-colors">
                  <LayoutDashboard size={18} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Command Center</h3>
                <p className="text-slate-500 mt-2 max-w-xs text-xs md:text-sm font-medium leading-snug">
                  Revenue tracking, attendance metrics, and growth analytics vault.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2 font-black uppercase text-[9px] tracking-widest text-indigo-600 group-hover:gap-4 transition-all">
                Execute Terminal <ArrowRight size={12} />
              </div>
            </div>
            <BarChart3 size={160} className="absolute bottom-[-20px] right-[-20px] text-slate-50 opacity-10 group-hover:opacity-20 transition-all" />
          </motion.div>

          {/* MEMBERS CARD - High Density */}
          <motion.div 
            whileHover={{ y: -4 }} 
            onClick={() => navigate("/members")}
            className="md:col-span-4 md:row-span-2 bg-indigo-600 p-6 md:p-8 rounded-[1.8rem] cursor-pointer shadow-xl shadow-indigo-100 text-white relative overflow-hidden group transition-all"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">Athlete<br/>Registry</h3>
                <p className="text-indigo-100/70 mt-2 text-xs font-medium">CRM & Billing Management.</p>
              </div>
              <ArrowRight size={20} className="mt-4 opacity-50 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </motion.div>

          {/* MINI ACTIONS - Professional Small Buttons */}
          <motion.div 
            whileHover={{ y: -3 }} 
            onClick={() => navigate("/punch-in")} 
            className="md:col-span-4 bg-white border border-slate-200 p-4 rounded-[1.2rem] cursor-pointer flex items-center gap-3 hover:border-indigo-200 transition-all"
          >
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="font-black uppercase italic text-xs text-slate-900 leading-none">Punch In</h4>
              <p className="text-slate-400 text-[8px] font-bold tracking-widest uppercase mt-1">Bio-Auth</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }} 
            onClick={() => navigate("/revenue")} 
            className="md:col-span-4 bg-white border border-slate-200 p-4 rounded-[1.2rem] cursor-pointer flex items-center gap-3 hover:border-indigo-200 transition-all"
          >
            <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <div>
              <h4 className="font-black uppercase italic text-xs text-slate-900 leading-none">Financials</h4>
              <p className="text-slate-400 text-[8px] font-bold tracking-widest uppercase mt-1">Audit Logs</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }} 
            onClick={() => navigate("/archives")} 
            className="md:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-[1.2rem] cursor-pointer flex items-center gap-3 hover:bg-white hover:border-rose-100 transition-all"
          >
            <div className="w-9 h-9 bg-white text-slate-300 rounded-lg flex items-center justify-center shrink-0 group-hover:text-rose-500">
              <History size={16} />
            </div>
            <div>
              <h4 className="font-black uppercase italic text-xs text-slate-900 leading-none">The Vault</h4>
              <p className="text-slate-400 text-[8px] font-bold tracking-widest uppercase mt-1">Archive</p>
            </div>
          </motion.div>

        </div>

        {/* SYSTEM FOOTER */}
        <footer className="mt-12 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
          <div className="flex gap-4">
            <FeatureBadge icon={<ShieldCheck size={10}/>} text="Encrypted" />
            <FeatureBadge icon={<QrCode size={10}/>} text="v2.5.2" />
          </div>
          <p className="text-[8px] uppercase tracking-[0.4em] font-black text-slate-400">
            HEALTH ADDICTION GYM INTELLIGENCE © 2026
          </p>
        </footer>

      </main>
    </div>
  );
}

function FeatureBadge({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-900 font-black text-[8px] uppercase tracking-widest">
      <span className="text-indigo-600">{icon}</span> {text}
    </div>
  );
}