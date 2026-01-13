import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { IndianRupee, Hash, Calendar, Wallet } from "lucide-react";

export default function PaymentHistory({ memberId }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    supabase.from("payments")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments(data || []));
  }, [memberId]);

  // Calculate Total Money
  const totalMoney = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Financial Logs</h3>
          {/* TOTAL MONEY DISPLAY */}
          <p className="text-xl font-black text-slate-950 mt-1">₹{totalMoney.toLocaleString()}</p>
        </div>
        <p className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest">
            {payments.length} Records
        </p>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {payments.length === 0 ? (
          <p className="text-center py-10 text-[9px] font-bold uppercase text-slate-300">No records</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-400 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <IndianRupee size={16} />
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 leading-none">₹{p.amount}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">
                    <span className="text-slate-400 font-black">ID:</span> {p.receipt_no}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-950 uppercase italic flex items-center justify-end gap-1">
                   {new Date(p.created_at).toLocaleDateString()}
                </p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-0.5">{p.payment_mode}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}