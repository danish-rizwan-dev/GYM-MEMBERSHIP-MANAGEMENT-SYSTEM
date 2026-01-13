import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { CheckCircle2, Clock, Calendar, Activity } from "lucide-react";

export default function AttendanceHistory({ memberId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    supabase.from("attendance")
      .select("*")
      .eq("member_id", memberId)
      .order("checkin_date", { ascending: false })
      .then(({ data }) => setLogs(data || []));
  }, [memberId]);

  // Calculate this month's attendance
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyCount = logs.filter(log => {
    const d = new Date(log.checkin_date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
           <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Activity Logs</h3>
           <p className="text-xl font-black text-slate-950 mt-1">{monthlyCount} <span className="text-[10px] text-slate-400 uppercase tracking-widest">Days this month</span></p>
        </div>
        <div className="text-right">
            <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase">Total: {logs.length}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-center py-10 text-[9px] font-bold uppercase text-slate-300">No logs</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-400 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">Verified Entry</p>
                  <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                    <Clock size={8} /> Biometric Sync
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-950 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {new Date(log.checkin_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}