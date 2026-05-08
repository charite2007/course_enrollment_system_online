import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { enrollments } from "../api/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } } };

export default function MyCourses() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollments.getMy()
      .then((d) => setItems(d.enrollments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const inProgress = items.filter((e) => e.progress > 0 && e.progress < 100);
  const completed = items.filter((e) => e.progress === 100);
  const notStarted = items.filter((e) => e.progress === 0);

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">My Courses</h1>
        <p className="mt-1 text-sm text-white/40">
          {items.length} enrolled · <span className="text-orange-400">{inProgress.length} in progress</span> · <span className="text-emerald-400">{completed.length} completed</span>
        </p>
      </motion.div>

      {items.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-4xl mb-3">📚</motion.div>
          <div className="text-sm font-extrabold text-white">No courses yet</div>
          <div className="mt-1 text-sm text-white/40">Browse available courses and start learning.</div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/find-courses")} className="btn-brand mt-5 rounded-xl px-6 py-2.5 text-sm">Find Courses</motion.button>
        </motion.div>
      )}

      {inProgress.length > 0 && <Section title="In Progress" items={inProgress} navigate={navigate} />}
      {notStarted.length > 0 && <Section title="Not Started" items={notStarted} navigate={navigate} />}
      {completed.length > 0 && <Section title="Completed" items={completed} navigate={navigate} />}
    </div>
  );
}

function Section({ title, items, navigate }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/30">{title}</div>
      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
        {items.map((en) => {
          const pct = en.progress ?? 0;
          const done = pct === 100;
          return (
            <motion.div
              key={en._id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-3 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-extrabold text-white">{en.courseId?.title || "Course"}</div>
                {done && <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">✓ Done</span>}
              </div>
              <div className="text-xs text-white/40">👤 {en.courseId?.instructor || "—"} · {en.courseId?.category || "—"}</div>
              <div>
                <div className="flex justify-between text-[10px] text-white/30 mb-1"><span>Progress</span><span>{pct}%</span></div>
                <div className="h-1.5 w-full rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    className={["h-1.5 rounded-full", done ? "bg-emerald-400" : "bg-orange-400"].join(" ")}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-auto pt-1">
                {done ? (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/certificates")} className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition">View Certificate</motion.button>
                ) : (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(`/lesson/${en.courseId?._id}`)} className="btn-brand flex-1 rounded-xl py-2 text-xs">{pct === 0 ? "Start Course" : "Continue →"}</motion.button>
                )}
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate(`/courses/${en.courseId?._id}`)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/50 hover:bg-white/10 transition">Details</motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
