import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Dumbbell, Zap, ChevronRight, LogOut } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Members", path: "/members" },
    { name: "Punch In", path: "/punch-in" }
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isOpen]);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 md:px-6 pt-4 md:pt-6 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-out
          rounded-[1.5rem] md:rounded-[2.5rem] border overflow-hidden
          ${
            scrolled
              ? "backdrop-blur-2xl py-2 bg-white/80 border-black/10 shadow-xl"
              : "backdrop-blur-md py-3 md:py-4 bg-white/40 border-black/5"
          }
        `}
      >
        <div className="px-5 md:px-8 flex justify-between items-center">
          {/* LOGO SECTION */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-all">
              <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
                GYM<span className="text-indigo-600">HA</span>
              </h1>
              <span className="hidden xs:block text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">OS Intelligence</span>
            </div>
          </Link>

          {/* DESKTOP NAV + LOGOUT */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex gap-1 p-1 bg-black/5 rounded-full border border-black/5 font-sans">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <span className={`relative z-10 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-500 hover:text-slate-900"}`}>
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-slate-950 rounded-full shadow-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2 hover:bg-rose-50 rounded-full transition-colors group/logout"
            >
              <LogOut size={14} className="text-slate-400 group-hover/logout:text-rose-600 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/logout:text-rose-600">Logout</span>
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg active:scale-90 transition-transform"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100vh", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden fixed inset-x-0 top-0 bg-white z-[-1] flex flex-col justify-center px-8"
            >
              <div className="space-y-6 mt-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Navigational Protocol</p>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`group flex items-center justify-between py-4 border-b border-slate-100 transition-colors ${
                        location.pathname === link.path ? "text-indigo-600" : "text-slate-950"
                      }`}
                    >
                      <span className="text-4xl font-black uppercase italic tracking-tighter">
                        {link.name}
                      </span>
                      <ChevronRight className={`transition-transform ${location.pathname === link.path ? "translate-x-0" : "-translate-x-4 opacity-0"}`} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* MOBILE LOGOUT CARD */}
              <div className="absolute bottom-12 left-8 right-8 space-y-4">
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-6 bg-rose-50 rounded-[2rem] border border-rose-100 group active:scale-95 transition-transform"
                 >
                    <LogOut size={20} className="text-rose-600" />
                    <span className="text-sm font-black uppercase tracking-widest text-rose-600">Terminate Session</span>
                 </button>
                 
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Health Addiction Gym</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-slate-900 uppercase">System Active</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
}