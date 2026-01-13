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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  useEffect(() => setIsOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 md:px-6 pt-3 md:pt-6 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          w-full max-w-6xl pointer-events-auto transition-all duration-500 ease-out
          rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden
          ${
            scrolled || isOpen
              ? "backdrop-blur-2xl py-2 bg-white/90 border-slate-200 shadow-2xl"
              : "backdrop-blur-md py-3 md:py-4 bg-white/40 border-black/5 shadow-sm"
          }
        `}
      >
        <div className="px-4 md:px-8 flex justify-between items-center">
          {/* LOGO SECTION - Scale down for tiny screens */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 group relative z-[110]">
            <div className="w-8 h-8 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg group-hover:bg-indigo-600 transition-all">
              <Dumbbell className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base md:text-2xl font-black tracking-tighter text-slate-950 uppercase italic leading-none">
                GYM<span className="text-indigo-600">HA</span>
              </h1>
              <span className="hidden xs:block text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">OS Intelligence</span>
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

          {/* MOBILE TOGGLE - Better Touch Area */}
          <div className="lg:hidden flex items-center gap-2 relative z-[110]">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-3 rounded-2xl shadow-lg active:scale-90 transition-all ${
                isOpen ? "bg-indigo-600 text-white" : "bg-slate-950 text-white"
              }`}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY - Optimized for Reachability */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute inset-x-0 top-full mt-2 mx-0 bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col p-6 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-2">System Directory</p>
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        className={`group flex items-center justify-between p-5 rounded-2xl transition-all ${
                          isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600 active:bg-slate-100"
                        }`}
                      >
                        <span className="text-2xl font-black uppercase italic tracking-tighter">
                          {link.name}
                        </span>
                        <ChevronRight size={20} className={`transition-transform ${isActive ? "translate-x-0" : "-translate-x-2 opacity-0"}`} />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* MOBILE LOGOUT */}
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleLogout}
                  className="mt-6 flex items-center justify-center gap-3 p-5 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600 active:scale-95 transition-transform"
                >
                  <LogOut size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                </motion.button>

                <div className="mt-4 p-4 text-center">
                   <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Active</p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* BACKGROUND BLUR OVERLAY - Closes menu on click */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[-1] lg:hidden"
          />
        )}
      </AnimatePresence>
    </nav>
  );
}