import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Receipt, IndianRupee, Zap, Loader2, ShieldCheck, Wallet2, Smartphone } from "lucide-react";

const PLANS = {
  MONTHLY: { label: "Monthly", months: 1, price: 1500 },
  QUARTERLY: { label: "Quarterly", months: 3, price: 4000 },
  YEARLY: { label: "Yearly", months: 12, price: 14000 },
};

export default function EditMembership({ memberId, onSuccess }) {
  const [plan, setPlan] = useState("MONTHLY");
  const [amount, setAmount] = useState(PLANS.MONTHLY.price);
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI"); // New State
  const [loading, setLoading] = useState(false);

async function handleAction() {
  if (!receiptNo) { alert("Receipt No Required"); return; }
  setLoading(true);

  try {
    // 1. Calculate a clean End Date
    const end = new Date();
    end.setMonth(end.getMonth() + PLANS[plan].months);
    
    // Use local date strings to avoid UTC "Previous Day" bugs
    const startDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const endDate = end.toLocaleDateString('en-CA'); // YYYY-MM-DD

    // 2. Insert New Membership
    await supabase.from("memberships").insert([{
      member_id: memberId,
      plan: PLANS[plan].label,
      start_date: startDate,
      end_date: endDate,
    }]);

    // 3. Insert Payment
    await supabase.from("payments").insert([{
      member_id: memberId,
      amount: parseFloat(amount),
      receipt_no: receiptNo,
      payment_mode: paymentMode,
      type: "RENEWAL"
    }]);

    if (onSuccess) await onSuccess(); 
    
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 space-y-6 relative overflow-hidden shadow-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-600 rounded-lg text-white"><Zap size={16} fill="currentColor" /></div>
        <div>
          <h4 className="font-black text-slate-900 uppercase italic leading-none">Plan Manager</h4>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assign or Extend Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Package Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select Package</label>
          <select
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={plan}
            onChange={(e) => { setPlan(e.target.value); setAmount(PLANS[e.target.value].price); }}
          >
            {Object.entries(PLANS).map(([key, p]) => (
              <option key={key} value={key}>{p.label} (₹{p.price})</option>
            ))}
          </select>
        </div>

        {/* Receipt Number */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Receipt / Bill No.</label>
          <div className="relative">
            <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              className="w-full p-4 pl-10 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="REC-XXXX"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
            />
          </div>
        </div>

        {/* PAYMENT MODE SELECTION */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Payment Method</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMode("UPI")}
              className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                paymentMode === "UPI" 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200"
              }`}
            >
              <Smartphone size={14} /> UPI / Online
            </button>
            <button
              onClick={() => setPaymentMode("Cash")}
              className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${
                paymentMode === "Cash" 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200"
              }`}
            >
              <Wallet2 size={14} /> Hard Cash
            </button>
          </div>
        </div>

        {/* Final Amount */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Final Amount (₹)</label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" size={16} />
            <input
              className="w-full p-4 pl-12 bg-indigo-50/30 border border-indigo-100 rounded-xl font-black text-lg text-indigo-600 outline-none"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleAction}
        disabled={loading}
        className="w-full bg-slate-950 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-100/50"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <><ShieldCheck size={16} /> Authorize Plan</>}
      </button>
    </div>
  );
}