import { useState } from "react";
import { supabase } from "../lib/supabase";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export default function AttendanceButton({ member }) {
  const [loading, setLoading] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState("");

  async function markAttendance() {
    setError("");
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Check membership validity
    if (!member.end_date || new Date(member.end_date) < new Date()) {
      setError("Membership expired. Renewal required.");
      setLoading(false);
      return;
    }

    // 2️⃣ Insert attendance (unique index handles duplicates)
    const { error } = await supabase.from("attendance").insert([
      {
        member_id: member.id,
        checkin_date: today,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        setError("Attendance already marked today");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    setMarked(true);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <button
        onClick={markAttendance}
        disabled={loading || marked}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs
          flex items-center justify-center gap-2 transition-all
          ${
            marked
              ? "bg-emerald-500/20 text-emerald-600 border border-emerald-300"
              : "bg-slate-900 hover:bg-black text-white"
          }
        `}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {marked ? (
          <>
            <CheckCircle className="w-4 h-4" /> Attendance Marked
          </>
        ) : (
          "Mark Attendance"
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-rose-600 text-sm font-medium">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
