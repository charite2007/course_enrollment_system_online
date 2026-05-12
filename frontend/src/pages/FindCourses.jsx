import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { courses, enrollments } from "../api/api";
import { useToast } from "../context/ToastContext";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];
const LEVEL_BADGE = { Beginner: "badge-green", Intermediate: "badge-orange", Advanced: "badge-violet" };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const cardAnim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .3, ease: "easeOut" } } };

export default function FindCourses() {
  const navigate = useNavigate();
  const toast = useToast();
  const [all, setAll] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([courses.getAll(), enrollments.getMy()])
      .then(([c, e]) => { if (!alive) return; setAll(c.courses || []); setMyEnrollments(e.enrollments || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { alive = false; };
  }, []);

  const enrolledIds = useMemo(() => new Set(myEnrollments.map((e) => String(e.courseId?._id))), [myEnrollments]);

  const filtered = useMemo(() => {
    let list = all;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(s) || c.instructor.toLowerCase().includes(s) || c.category.toLowerCase().includes(s));
    }
    if (level !== "All") list = list.filter((c) => c.level === level);
    return list;
  }, [all, q, level]);

  async function handleEnroll(courseId, courseTitle) {
    setEnrollingId(courseId);
    try {
      await enrollments.enroll(courseId);
      toast(`Enrolled in "${courseTitle}" successfully!`, "success");
      setMyEnrollments((prev) => [...prev, { courseId: { _id: courseId } }]);
      setTimeout(() => navigate(`/enrollment-confirmation/${courseId}`), 800);
    } catch (err) {
      toast(err?.response?.data?.message || "Enrollment failed", "error");
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Find Courses</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
          {all.length} courses available · <span className="text-orange-400 font-semibold">{myEnrollments.length} enrolled</span>
        </p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-3)" }}>🔍</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, instructor, category…"
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {LEVELS.map((l) => (
            <motion.button
              key={l}
              whileTap={{ scale: .95 }}
              onClick={() => setLevel(l)}
              className={[
                "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition border",
                level === l
                  ? "bg-orange-500/15 border-orange-500/30 text-orange-400"
                  : "border-white/10 bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/70",
              ].join(" ")}
            >
              {l}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="skeleton h-5 w-3/4 rounded-lg" />
              <div className="skeleton h-3 w-full rounded-lg" />
              <div className="skeleton h-3 w-2/3 rounded-lg" />
              <div className="skeleton h-8 w-full rounded-xl mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Course grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div key={`${q}-${level}`} variants={stagger} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => {
              const enrolled = enrolledIds.has(String(c._id));
              const isEnrolling = enrollingId === c._id;
              const enrollment = myEnrollments.find((e) => String(e.courseId?._id) === String(c._id));
              return (
                <motion.div
                  key={c._id}
                  variants={cardAnim}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="card p-5 flex flex-col gap-3"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-extrabold text-white leading-snug">{c.title}</p>
                    <span className={`badge shrink-0 ${c.price ? "badge-orange" : "badge-green"}`}>
                      {c.price ? `$${c.price}` : "Free"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm line-clamp-2" style={{ color: "var(--text-3)" }}>{c.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="badge badge-muted">{c.category}</span>
                    <span className={`badge ${LEVEL_BADGE[c.level] || "badge-muted"}`}>{c.level}</span>
                    <span className="badge badge-muted">👤 {c.instructor}</span>
                    {c.durationHours > 0 && <span className="badge badge-muted">⏱ {c.durationHours}h</span>}
                  </div>

                  {/* Progress bar if enrolled */}
                  {enrolled && enrollment?.progress !== undefined && (
                    <div>
                      <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "var(--text-3)" }}>
                        <span>Progress</span>
                        <span className="font-bold text-orange-400">{enrollment.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          className={`progress-fill ${enrollment.progress === 100 ? "done" : ""}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${enrollment.progress}%` }}
                          transition={{ duration: .7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/courses/${c._id}`)}
                      className="btn-ghost flex-1 rounded-xl py-2 text-xs"
                    >
                      Details
                    </button>
                    {enrolled ? (
                      <button
                        onClick={() => navigate(`/lesson/${c._id}`)}
                        className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition"
                      >
                        {enrollment?.progress === 100 ? "✓ Completed" : "Continue →"}
                      </button>
                    ) : (
                      <button
                        disabled={isEnrolling}
                        onClick={() => handleEnroll(c._id, c.title)}
                        className="btn-brand flex-1 rounded-xl py-2 text-xs"
                      >
                        {isEnrolling ? "Enrolling…" : "Enroll Now"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full card p-10 text-center"
              >
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm font-bold text-white">No courses found</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>Try a different search or filter.</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
