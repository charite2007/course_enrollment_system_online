import { useEffect, useMemo, useState } from "react";
import { enrollments } from "../../api/api";

export default function AdminEnrollments() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | completed | in-progress | not-started

  useEffect(() => {
    let alive = true;
    enrollments
      .getAll()
      .then((d) => alive && setItems(d.enrollments || []))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (e) =>
          e.studentId?.Fullname?.toLowerCase().includes(s) ||
          e.courseId?.title?.toLowerCase().includes(s)
      );
    }
    if (filter === "completed") list = list.filter((e) => e.progress === 100);
    else if (filter === "in-progress") list = list.filter((e) => e.progress > 0 && e.progress < 100);
    else if (filter === "not-started") list = list.filter((e) => e.progress === 0);
    return list;
  }, [items, q, filter]);

  const tabs = [
    { key: "all", label: "All", count: items.length },
    { key: "completed", label: "Completed", count: items.filter((e) => e.progress === 100).length },
    { key: "in-progress", label: "In Progress", count: items.filter((e) => e.progress > 0 && e.progress < 100).length },
    { key: "not-started", label: "Not Started", count: items.filter((e) => e.progress === 0).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Enrollments</h1>
          <p className="mt-1 text-sm text-white/40">{items.length} total enrollments</p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search student or course..."
          className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 transition"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={[
              "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition",
              filter === t.key
                ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                : "border border-white/10 bg-white/5 text-white/40 hover:bg-white/8",
            ].join(" ")}
          >
            {t.label}
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-black/20">
              <tr>
                {["Student", "Course", "Progress", "Status", "Enrolled On"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white/30">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((e) => {
                const pct = e.progress ?? 0;
                const status =
                  pct === 100 ? "completed" : pct > 0 ? "in-progress" : "not-started";
                return (
                  <tr key={e._id} className="hover:bg-white/2 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500/15 text-xs font-extrabold text-orange-400">
                          {e.studentId?.Fullname?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{e.studentId?.Fullname || "—"}</div>
                          <div className="text-xs text-white/30">{e.studentId?.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{e.courseId?.title || "—"}</div>
                      <div className="text-xs text-white/30">{e.courseId?.instructor || ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-white/10">
                          <div
                            className={[
                              "h-1.5 rounded-full transition-all",
                              pct === 100 ? "bg-emerald-400" : "bg-orange-400",
                            ].join(" ")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white/60">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-bold",
                          status === "completed"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : status === "in-progress"
                            ? "border border-orange-500/30 bg-orange-500/10 text-orange-400"
                            : "border border-white/10 bg-white/5 text-white/40",
                        ].join(" ")}
                      >
                        {status === "completed" ? "✓ Completed" : status === "in-progress" ? "⟳ In Progress" : "○ Not Started"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-white/30">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
