import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";

const FILTERS = {
  DAILY: "Today",
  MONTHLY: "This Month",
  YEARLY: "This Year",
  LIFETIME: "Lifetime",
};

export default function Revenue() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ✅ READ FILTER FROM URL
  const defaultFilter = params.get("filter") || "MONTHLY";
  const [filter, setFilter] = useState(defaultFilter);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, [filter]);

  async function fetchRevenue() {
    setLoading(true);

    let query = supabase
      .from("payments")
      .select("amount, created_at, members(id, full_name, phone)");

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    if (filter === "DAILY") {
      query = query.gte(
        "created_at",
        today.toISOString().split("T")[0]
      );
    }

    if (filter === "MONTHLY") {
      query = query.gte("created_at", startOfMonth.toISOString());
    }

    if (filter === "YEARLY") {
      query = query.gte("created_at", startOfYear.toISOString());
    }

    // LIFETIME → no filter

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // ✅ GROUP BY MEMBER
    const map = {};
    data?.forEach((p) => {
      const id = p.members.id;
      if (!map[id]) {
        map[id] = {
          member: p.members,
          total: 0,
        };
      }
      map[id].total += p.amount;
    });

    setRows(Object.values(map));
    setLoading(false);
  }

  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <Navbar />

      {/* FIXED NAVBAR OFFSET */}
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-black text-slate-900">
            Revenue
          </h2>

          {/* FILTER DROPDOWN */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              navigate(`/revenue?filter=${e.target.value}`);
            }}
            className="border rounded-xl p-3 font-bold"
          >
            {Object.entries(FILTERS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* TOTAL */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <p className="text-sm font-bold text-emerald-700">
            Total Revenue
          </p>
          <p className="text-4xl font-black text-emerald-900">
            ₹{grandTotal}
          </p>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-center text-slate-500">
            Loading revenue…
          </p>
        ) : rows.length === 0 ? (
          <p className="text-center text-slate-500 italic">
            No revenue found
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div
                key={i}
                onClick={() =>
                  navigate(`/members/${r.member.id}`)
                }
                className="flex justify-between items-center p-4 rounded-2xl border bg-white hover:border-cyan-500 cursor-pointer transition"
              >
                <div>
                  <p className="font-bold">
                    {r.member.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {r.member.phone}
                  </p>
                </div>

                <p className="font-black text-slate-900">
                  ₹{r.total}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
