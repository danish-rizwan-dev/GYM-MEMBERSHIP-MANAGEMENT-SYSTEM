import { useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import { UserPlus, IndianRupee, Check, Loader2, Hash } from "lucide-react";

export default function AddMemberForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.target);
    
    // Member Data
    const memberData = {
      full_name: fd.get("full_name"),
      phone: fd.get("phone"),
      age: fd.get("age") ? parseInt(fd.get("age")) : null,
      gender: fd.get("gender"),
      emergency_contact: fd.get("emergency_contact"),
    };

    // Payment Data
    const amount = parseFloat(fd.get("amount"));
    const receipt_no = fd.get("receipt_no") || `REC-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Create Member
      const { data: member, error: mErr } = await supabase
        .from("members")
        .insert([memberData])
        .select()
        .single();

      if (mErr) throw mErr;

      // 2. Create Initial Payment
      if (amount > 0) {
        const { error: pErr } = await supabase.from("payments").insert([
          {
            member_id: member.id,
            amount: amount,
            receipt_no: receipt_no,
            payment_mode: fd.get("payment_mode"),
            type: "ADMISSION",
          },
        ]);
        if (pErr) throw pErr;
      }

      onSuccess();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <UserPlus size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900">New Registration</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Athlete Entry Protocol</p>
        </div>
      </div>

      {/* BIO DATA SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputGroup label="Full Name" name="full_name" placeholder="Full name of athlete" required />
        <InputGroup label="Phone Number" name="phone" placeholder="Contact number" required />
        <InputGroup label="Age" name="age" type="number" placeholder="Years" />
        
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</label>
          <select name="gender" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <InputGroup label="Emergency Contact" name="emergency_contact" placeholder="Name or phone" />

      <hr className="border-slate-100 my-2" />

      {/* FEES SECTION - LIGHT THEME */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Financial Entry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <IndianRupee size={10} /> Fees (₹)
            </label>
            <input 
              name="amount" 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-sm font-black text-indigo-900 placeholder:text-indigo-200 focus:ring-2 focus:ring-indigo-500/20 outline-none" 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
              <Hash size={10} /> Receipt No.
            </label>
            <input 
              name="receipt_no" 
              placeholder="Optional" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-900 outline-none" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mode</label>
            <select name="payment_mode" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold outline-none">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / QR</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        disabled={loading}
        className="w-full py-4 bg-slate-950 hover:bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <Check size={16} /> Complete Registration
          </>
        )}
      </button>
    </form>
  );
}

function InputGroup({ label, name, type = "text", placeholder, required = false }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
      />
    </div>
  );
}