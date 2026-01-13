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

  useEffect(() => setIsOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4 md:pt-6 pointer-events-none">
      <motion.div
        className={`
          w-full max-w-6xl pointer-events-auto transition-all duration-500
          rounded-[2rem] border overflow-visible
          ${scrolled || isOpen ? "bg-white/95 backdrop-blur-xl border-slate-200 shadow-2xl" : "bg-white/50 backdrop-blur-md border-white/20"}
        `}
      >
        <div className="px-5 py-3 md:py-4 flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 z-[110]">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center shadow-lg">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-950 uppercase italic">
              GYM<span className="text-indigo-600">HA</span>
            </h1>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1 rounded-full border border-slate-200">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${
                    isActive ? "bg-slate-950 text-white shadow-md" : "text-slate-500 hover:text-slate-950"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* MOBILE TOGGLE & DESKTOP LOGOUT */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 hover:bg-rose-50 rounded-xl transition-colors group"
            >
              <LogOut size={14} className="text-slate-400 group-hover:text-rose-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-rose-600">Logout</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 bg-slate-950 text-white rounded-2xl shadow-lg active:scale-90 transition-all z-[110]"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="lg:hidden absolute top-[calc(100%+10px)] left-0 right-0 bg-white border border-slate-200 rounded-[2rem] p-4 shadow-2xl flex flex-col gap-2 origin-top"
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex justify-between items-center p-5 rounded-2xl transition-all ${
                      isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="text-xl font-black uppercase italic tracking-tighter">{link.name}</span>
                    <ChevronRight size={18} className={isActive ? "opacity-100" : "opacity-0"} />
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-3 p-5 mt-2 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-rose-100 shadow-sm"
              >
                <LogOut size={18} /> Terminate Session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CLICK OUTSIDE TO CLOSE */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm lg:hidden z-[-1]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </nav>
  );
}