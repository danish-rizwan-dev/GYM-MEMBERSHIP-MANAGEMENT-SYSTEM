import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FILTERS = {
  DAILY: "Today",
  MONTHLY: "This Month",
  YEARLY: "This Year",
  CUSTOM: "Specific Date",
};

export default function DailyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("DAILY");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendance();
  }, [filter, customDate]);

  async function fetchAttendance() {
    setLoading(true);
    
    let query = supabase
      .from("attendance")
      .select("checkin_date, members(id, full_name, phone)");

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    const startOfYear = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];

    // Apply Filter Logic
    if (filter === "DAILY") {
      query = query.eq("checkin_date", today.toISOString().split("T")[0]);
    } else if (filter === "MONTHLY") {
      query = query.gte("checkin_date", startOfMonth);
    } else if (filter === "YEARLY") {
      query = query.gte("checkin_date", startOfYear);
    } else if (filter === "CUSTOM") {
      query = query.eq("checkin_date", customDate);
    }

    const { data, error } = await query.order("checkin_date", { ascending: false });

    if (!error) setAttendance(data || []);
    setLoading(false);
  }

  const filtered = attendance.filter(
    (a) =>
      a.members?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.members?.phone.includes(search)
  );

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-4xl font-black text-slate-900">Attendance</h2>
          
          <div className="flex items-center gap-2">
            {/* Custom Date Picker (Visible only when CUSTOM filter is selected) */}
            {filter === "CUSTOM" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="border rounded-xl p-3 font-bold text-sm bg-white shadow-sm"
              />
            )}

            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-xl p-3 font-bold text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {Object.entries(FILTERS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full border rounded-2xl pl-12 p-4 shadow-sm outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-center text-slate-500">Loading attendance…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-20 text-center">
             <p className="text-slate-500 italic">No records found for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">
              Showing {filtered.length} logs
            </p>
            {filtered.map((a, i) => (
              <div
                key={i}
                onClick={() => navigate(`/members/${a.members.id}`)}
                className="flex justify-between items-center p-4 rounded-2xl border bg-white hover:border-cyan-500 cursor-pointer transition shadow-sm group"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition">
                      <CalendarIcon size={18} />
                   </div>
                   <div>
                    <p className="font-bold text-slate-900">{a.members.full_name}</p>
                    <p className="text-sm text-slate-500">{a.members.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Present
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{a.checkin_date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}