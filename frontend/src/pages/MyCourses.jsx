import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { enrollments } from "../api/api";
import { useToast } from "../context/ToastContext";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .32, ease: "easeOut" } } };

function ConfirmDialog({ open, courseName, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: .94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .94, y: 12 }}
        transition={{ duration: .2 }}
        className="modal-box p-6 max-w-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15 text-xl">🗑</div>
          <div>
            <p className="font-extrabold text-white">Remove enrollment?</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>
          You will be unenrolled from <span className="font-bold text-white">"{courseName}"</span> and your progress will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost rounded-xl px-5 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-2 text-sm font-bold text-red-400 hover:bg-red-500/25 transition">
            Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function MyCourses() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    enrollments.getMy()
      .then((d) => setItems(d.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUnenroll() {
    const { courseId, title } = confirm;
    setConfirm(null);
    setRemoving(courseId);
    try {
      await enrollments.unenroll(courseId);
      setItems((prev) => prev.filter((e) => String(e.courseId?._id) !== String(courseId)));
      toast(`Removed from "${title}"`, "success");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to remove enrollment", "error");
    } finally {
      setRemoving(null);
    }
  }

  const inProgress = items.filter((e) => e.progress > 0 && e.progress < 100);
  const completed   = items.filter((e) => e.progress === 100);
  const notStarted  = items.filter((e) => e.progress === 0);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin-slow" />
    </div>
  );

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            open={!!confirm}
            courseName={confirm.title}
            onConfirm={handleUnenroll}
            onCancel={() => setConfirm(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">My Courses</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
          {items.length} enrolled ·{" "}
          <span className="text-orange-400 font-semibold">{inProgress.length} in progress</span> ·{" "}
          <span className="text-emerald-400 font-semibold">{completed.length} completed</span>
        </p>
      </motion.div>

      {/* Empty state */}
      {items.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .1 }} className="card p-14 text-center">
          <div className="animate-float text-5xl mb-4">📚</div>
          <p className="text-base font-extrabold text-white">No courses yet</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>Browse available courses and start learning.</p>
          <button onClick={() => navigate("/find-courses")} className="btn-brand mt-6 rounded-xl px-8 py-2.5 text-sm">Find Courses</button>
        </motion.div>
      )}

      {inProgress.length > 0 && <Section title="In Progress" items={inProgress} navigate={navigate} onRemove={setConfirm} removing={removing} />}
      {notStarted.length  > 0 && <Section title="Not Started"  items={notStarted}  navigate={navigate} onRemove={setConfirm} removing={removing} />}
      {completed.length   > 0 && <Section title="Completed"    items={completed}    navigate={navigate} onRemove={setConfirm} removing={removing} />}
    </div>
  );
}

function Section({ title, items, navigate, onRemove, removing }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }}>
      <p className="section-label mb-4">{title}</p>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
        {items.map((en) => {
          const pct      = en.progress ?? 0;
          const done     = pct === 100;
          const courseId = en.courseId?._id;
          const isRemoving = removing === courseId;
          return (
            <motion.div
              key={en._id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              className="card p-5 flex flex-col gap-3"
            >
              {/* Title + badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-base">
                    {done ? "🏆" : "📖"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">{en.courseId?.title || "Course"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                      👤 {en.courseId?.instructor || "—"} · {en.courseId?.category || "—"}
                    </p>
                  </div>
                </div>
                {done && <span className="badge badge-green shrink-0">✓ Done</span>}
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "var(--text-3)" }}>
                  <span>Progress</span>
                  <span className={`font-bold ${done ? "text-emerald-400" : "text-orange-400"}`}>{pct}%</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className={`progress-fill ${done ? "done" : ""}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: .8, ease: "easeOut", delay: .2 }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                {done ? (
                  <button onClick={() => navigate("/certificates")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition">
                    View Certificate
                  </button>
                ) : (
                  <button onClick={() => navigate(`/lesson/${courseId}`)} className="btn-brand flex-1 rounded-xl py-2 text-xs">
                    {pct === 0 ? "Start Course" : "Continue →"}
                  </button>
                )}
                <button onClick={() => navigate(`/courses/${courseId}`)} className="btn-ghost rounded-xl px-3 py-2 text-xs">
                  Details
                </button>
                <button
                  disabled={isRemoving}
                  onClick={() => onRemove({ courseId, title: en.courseId?.title || "this course" })}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition"
                  title="Remove enrollment"
                >
                  {isRemoving ? "…" : "🗑"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
