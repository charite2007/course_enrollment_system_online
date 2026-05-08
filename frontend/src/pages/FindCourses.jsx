import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { courses, enrollments } from "../api/api";
import { useToast } from "../context/ToastContext";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const card = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function FindCourses() {
  const navigate = useNavigate();
  const toast = useToast();
  const [all, setAll] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    let alive = true;
    Promise.all([courses.getAll(), enrollments.getMy()])
      .then(([c, e]) => { if (!alive) return; setAll(c.courses || []); setMyEnrollments(e.enrollments || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const enrolledIds = useMemo(() => new Set(myEnrollments.map((e) => e.courseId?._id)), [myEnrollments]);

  const filtered = useMemo(() => {
    let list = all;
    if (q.trim()) list = list.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()) || c.instructor.toLowerCase().includes(q.toLowerCase()) || c.category.toLowerCase().includes(q.toLowerCase()));
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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Find Courses</h1>
        <p className="mt-1 text-sm text-white/40">{all.length} courses available · {myEnrollments.length} enrolled</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, instructor, category..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 transition" />
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <motion.button key={l} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setLevel(l)} className={["rounded-xl px-3 py-2 text-xs font-bold transition", level === l ? "bg-orange-500/20 border border-orange-500/30 text-orange-400" : "border border-white/10 bg-white/5 text-white/40 hover:bg-white/8"].join(" ")}>{l}</motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={`${q}-${level}`} variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const enrolled = enrolledIds.has(c._id);
            const isEnrolling = enrollingId === c._id;
            const enrollment = myEnrollments.find((e) => e.courseId?._id === c._id);
            return (
              <motion.div
                key={c._id}
                variants={card}
                whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.15)" }}
                className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 p-5 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-extrabold text-white leading-snug">{c.title}</div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50">{c.price ? `$${c.price}` : "Free"}</span>
                </div>
                <p className="text-xs text-white/40 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">{c.category}</span>
                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-orange-400">{c.level}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">👤 {c.instructor}</span>
                  {c.durationHours > 0 && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">⏱ {c.durationHours}h</span>}
                </div>

                {enrolled && enrollment?.progress !== undefined && (
                  <div>
                    <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>Progress</span><span>{enrollment.progress}%</span></div>
                    <div className="h-1.5 w-full rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${enrollment.progress}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={["h-1.5 rounded-full", enrollment.progress === 100 ? "bg-emerald-400" : "bg-orange-400"].join(" ")}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-auto flex gap-2 pt-1">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(`/courses/${c._id}`)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-white/70 hover:bg-white/10 transition">View Details</motion.button>
                  {enrolled ? (
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(`/lesson/${c._id}`)} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition">
                      {enrollment?.progress === 100 ? "✓ Completed" : "Continue →"}
                    </motion.button>
                  ) : (
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} disabled={isEnrolling} onClick={() => handleEnroll(c._id, c.title)} className="btn-brand flex-1 rounded-xl py-2 text-xs">
                      {isEnrolling ? "Enrolling…" : "Enroll Now"}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full rounded-2xl border border-white/8 bg-white/3 p-10 text-center text-sm text-white/30">
              No courses match your search.
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
